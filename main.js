
<!-- lingxi_website_sharing/frontend/js/main.js -->
document.addEventListener('DOMContentLoaded', function() {
    // 初始化增强版粒子效果
    initEnhancedParticles();
    
    // 加载内嵌数据
    loadEmbeddedData();
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

// 加载内嵌数据
function loadEmbeddedData() {
    const { websites } = parseWebsiteData(websiteData);
    renderWebsiteCards(websites);
    document.getElementById('loading').style.display = 'none';
}

// 解析网站数据
function parseWebsiteData(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const websites = [];
    
    lines.forEach(line => {
        const parts = line.split(' ');
        if (parts.length >= 2) {
            const url = parts[0];
            const name = parts.slice(1).join(' ').trim();
            
            websites.push({
                url,
                name,
                thumbnail: `https://picsum.photos/400/300?random=${Math.random()}`
            });
        }
    });
    
    return { websites };
}

// 渲染网站卡片
function renderWebsiteCards(websites) {
    const grid = document.getElementById('websiteGrid');
    grid.innerHTML = '';
    
    if (websites.length === 0) {
        document.getElementById('noResults').classList.remove('hidden');
        return;
    }
    
    websites.forEach(website => {
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
                <a href="${website.url}" target="_blank" rel="noopener noreferrer" 
                   class="inline-block w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-center rounded-lg transition-all duration-300 transform hover:scale-105">
                    <i class="fas fa-external-link-alt mr-2"></i>访问网站
                </a>
            </div>
        `;
        grid.appendChild(card);
    });
}
