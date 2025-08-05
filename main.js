
<!-- lingxi_website_sharing/frontend/js/main.js -->
document.addEventListener('DOMContentLoaded', function() {
    // 初始化增强版粒子效果
    initEnhancedParticles();
    
    // 加载默认数据
    loadDefaultData();
});

// 增强版粒子效果
function initEnhancedParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 250;
    const colors = ['#38b2ac', '#4299e1', '#9f7aea', '#ed64a6', '#f6ad55'];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 4 + 1,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.5 + 0.3,
            angle: 0,
            rotationSpeed: Math.random() * 0.02 - 0.01
        });
    }
    
    function drawLine(p1, p2, opacity) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(66, 153, 225, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.angle += particle.rotationSpeed;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
            
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.angle);
            ctx.beginPath();
            ctx.rect(-particle.size/2, -particle.size/2, particle.size, particle.size);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.alpha;
            ctx.fill();
            ctx.restore();
        });
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                
                if (distance < 150) {
                    const opacity = 1 - distance / 150;
                    drawLine(p1, p2, opacity);
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 加载默认数据
function loadDefaultData() {
    fetch('lingxi.txt')
        .then(response => response.text())
        .then(text => {
            const { websites, tags } = parseWebsiteData(text);
            renderTagFilters(tags);
            renderWebsiteCards(websites);
            document.getElementById('loading').style.display = 'none';
        })
        .catch(error => {
            console.error('加载默认数据失败:', error);
            document.getElementById('loading').innerHTML = `
                <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <p class="text-red-400">加载数据失败，请检查数据文件</p>
            `;
        });
}

// 解析网站数据
function parseWebsiteData(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const websites = [];
    const tags = new Set();
    
    lines.forEach(line => {
        const parts = line.split(' ');
        if (parts.length >= 2) {
            const url = parts[0];
            const nameAndTags = parts.slice(1);
            
            // 提取标签
            const websiteTags = [];
            const nameParts = [];
            
            nameAndTags.forEach(part => {
                if (part.startsWith('#')) {
                    const tag = part.substring(1);
                    websiteTags.push(tag);
                    tags.add(tag);
                } else {
                    nameParts.push(part);
                }
            });
            
            const name = nameParts.join(' ').trim();
            
            websites.push({
                url,
                name,
                tags: websiteTags,
                thumbnail: `https://picsum.photos/400/300?random=${Math.random()}`
            });
        }
    });
    
    return { 
        websites,
        tags: Array.from(tags).sort() 
    };
}

// 渲染标签筛选器
function renderTagFilters(tags) {
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'flex flex-wrap justify-center gap-2 mb-8';
    filtersContainer.id = 'tagFilters';
    
    // 添加"全部"标签
    const allTag = document.createElement('button');
    allTag.className = 'tag px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer transition-all hover:opacity-90 active:scale-95';
    allTag.textContent = '全部';
    allTag.dataset.tag = 'all';
    allTag.addEventListener('click', filterByTag);
    filtersContainer.appendChild(allTag);
    
    // 添加其他标签
    tags.forEach(tag => {
        const tagElement = document.createElement('button');
        tagElement.className = 'tag px-4 py-2 rounded-full bg-gray-700 text-gray-300 cursor-pointer transition-all hover:bg-gray-600 hover:text-white active:scale-95';
        tagElement.textContent = tag;
        tagElement.dataset.tag = tag;
        tagElement.addEventListener('click', filterByTag);
        filtersContainer.appendChild(tagElement);
    });
    
    // 插入到header后面
    const header = document.querySelector('header');
    header.insertAdjacentElement('afterend', filtersContainer);
}

// 按标签筛选
function filterByTag(e) {
    const selectedTag = e.target.dataset.tag;
    const tagButtons = document.querySelectorAll('#tagFilters button');
    
    // 更新按钮状态
    tagButtons.forEach(button => {
        if (button.dataset.tag === selectedTag) {
            button.className = 'tag px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer transition-all hover:opacity-90 active:scale-95';
        } else {
            button.className = 'tag px-4 py-2 rounded-full bg-gray-700 text-gray-300 cursor-pointer transition-all hover:bg-gray-600 hover:text-white active:scale-95';
        }
    });
    
    // 筛选网站
    fetch('lingxi.txt')
        .then(response => response.text())
        .then(text => {
            const { websites } = parseWebsiteData(text);
            let filteredWebsites = websites;
            
            if (selectedTag !== 'all') {
                filteredWebsites = websites.filter(website => 
                    website.tags.includes(selectedTag)
                );
            }
            
            renderWebsiteCards({ websites: filteredWebsites });
        });
}

// 渲染网站卡片
function renderWebsiteCards(data) {
    const grid = document.getElementById('websiteGrid');
    grid.innerHTML = '';
    
    if (data.websites.length === 0) {
        document.getElementById('noResults').classList.remove('hidden');
        return;
    }
    
    data.websites.forEach(website => {
        const card = document.createElement('div');
        card.className = 'card overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300';
        card.innerHTML = `
            <div class="relative">
                <img src="${website.thumbnail}" alt="${website.name}" 
                     class="website-thumbnail w-full h-48 object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                <div class="absolute bottom-4 left-4">
                    <h3 class="text-xl font-bold text-white">${website.name}</h3>
                </div>
            </div>
            <div class="p-4">
                <div class="flex flex-wrap gap-2 mb-3">
                    ${website.tags.map(tag => `
                        <span class="tag">#${tag}</span>
                    `).join('')}
                </div>
                <a href="${website.url}" target="_blank" rel="noopener noreferrer" 
                   class="inline-block w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-center rounded-lg transition-all duration-300 transform hover:scale-105">
                    <i class="fas fa-external-link-alt mr-2"></i>访问网站
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}
