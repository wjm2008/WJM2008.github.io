
<!-- word_dictation_tool/frontend/js/app.js -->
document.addEventListener('DOMContentLoaded', function() {
  // 全局变量
  let wordList = [];
  let currentIndex = 0;
  let timerInterval;
  let startTime;
  let isPlaying = false;
  let history = JSON.parse(localStorage.getItem('history')) || [];
  let repeatCounter = 0;
  let dictatedWords = [];
  let remainingWords = [];
  
  // DOM元素
  const wordFileInput = document.getElementById('wordFile');
  const loadBtn = document.getElementById('loadBtn');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const answerBtn = document.getElementById('answerBtn');
  const currentWordDisplay = document.getElementById('currentWord');
  const currentIndexDisplay = document.getElementById('currentIndex');
  const totalWordsDisplay = document.getElementById('totalWords');
  const timerDisplay = document.getElementById('timer');
  const historyList = document.getElementById('historyList');
  const soundEffect = document.getElementById('soundEffect');
  const answerSection = document.getElementById('answerSection');
  const answerList = document.getElementById('answerList');
  const summary = document.getElementById('summary');
  const compatibilityNotice = document.getElementById('compatibilityNotice');
  
  // 检查语音合成API支持情况
  function checkSpeechSynthesisSupport() {
    if (!('speechSynthesis' in window)) {
      compatibilityNotice.innerHTML = `
        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p class="font-bold">警告</p>
          <p>您的浏览器不支持语音合成API，将无法使用朗读功能。请使用最新版Chrome、Edge或Firefox浏览器。</p>
        </div>
      `;
      return false;
    }
    return true;
  }
  
  // 初始化
  updateHistoryDisplay();
  checkSpeechSynthesisSupport();
  
  // 事件监听
  loadBtn.addEventListener('click', loadWordFile);
  startBtn.addEventListener('click', startDictation);
  pauseBtn.addEventListener('click', pauseDictation);
  stopBtn.addEventListener('click', stopDictation);
  answerBtn.addEventListener('click', showAnswer);
  
  // 加载单词文件
  function loadWordFile() {
    const file = wordFileInput.files[0];
    if (!file) {
      alert('请先选择单词文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      wordList = lines.map(line => {
        const [english, ...chineseParts] = line.trim().split(' ');
        return {
          english: english.trim(),
          chinese: chineseParts.join(' ').trim()
        };
      }).filter(word => word.english && word.chinese);
      
      if (wordList.length === 0) {
        alert('单词文件为空或格式不正确，请确保每行格式为: 英文 中文');
        return;
      }
      
      totalWordsDisplay.textContent = wordList.length;
      currentIndex = 0;
      currentIndexDisplay.textContent = currentIndex;
      currentWordDisplay.textContent = '准备开始听写';
      
      alert(`成功加载 ${wordList.length} 个单词`);
    };
    reader.readAsText(file);
  }
  
  // 开始听写
  function startDictation() {
    if (wordList.length === 0) {
      alert('请先加载单词文件');
      return;
    }
    
    if (!checkSpeechSynthesisSupport()) {
      alert('您的浏览器不支持语音合成功能');
      return;
    }
    
    if (isPlaying) return;
    
    isPlaying = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    repeatCounter = 0;
    dictatedWords = [];
    
    // 重置索引或随机选择
    const mode = document.getElementById('mode').value;
    if (mode === 'random') {
      // 初始化剩余单词列表
      remainingWords = [...wordList];
      currentIndex = Math.floor(Math.random() * remainingWords.length);
    } else {
      currentIndex = 0;
    }
    
    currentIndexDisplay.textContent = currentIndex + 1;
    
    // 开始计时
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
    
    // 朗读第一个单词
    speakCurrentWord();
  }
  
  // 朗读当前单词（改进版）
  function speakCurrentWord() {
    if (!isPlaying) return;

    const mode = document.getElementById('mode').value;
    let wordObj;
    
    if (mode === 'random') {
      if (remainingWords.length === 0) {
        stopDictation();
        return;
      }
      wordObj = remainingWords[currentIndex];
    } else {
      if (currentIndex >= wordList.length) {
        stopDictation();
        return;
      }
      wordObj = wordList[currentIndex];
    }
    
    const language = document.getElementById('language').value;
    const wordToSpeak = language === 'zh' ? wordObj.chinese : wordObj.english;
    
    currentWordDisplay.textContent = '正在朗读...';
    
    // 记录听写过的单词
    if (!dictatedWords.some(w => w.english === wordObj.english)) {
      dictatedWords.push({
        ...wordObj,
        index: dictatedWords.length + 1
      });
    }
    
    try {
      // 停止任何正在进行的语音
      window.speechSynthesis.cancel();
      
      // 设置语音
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // 修复英文发音问题：强制使用英文语音
      if (language === 'en') {
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en') && !voice.lang.includes('en-IN')
        );
        
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
      
      utterance.onend = function() {
        repeatCounter++;
        const repeatCount = parseInt(document.getElementById('repeatCount').value);
        
        if (repeatCounter < repeatCount) {
          // 继续重复朗读
          setTimeout(() => speakCurrentWord(), 500);
        } else {
          // 播放提示音
          const soundType = document.getElementById('sound').value;
          soundEffect.src = `https://8bituniverse.com/sounds/${soundType}.mp3`;
          soundEffect.play();
          
          // 更新显示
          currentWordDisplay.textContent = '请写下这个单词';
          
          // 设置下一个单词的定时器
          const interval = parseInt(document.getElementById('interval').value) * 1000;
          setTimeout(nextWord, interval);
        }
      };
      
      utterance.onerror = function(event) {
        console.error('语音合成错误:', event);
        currentWordDisplay.textContent = '朗读失败: ' + event.error;
        setTimeout(() => {
          currentWordDisplay.textContent = '请写下这个单词';
          const interval = parseInt(document.getElementById('interval').value) * 1000;
          setTimeout(nextWord, interval);
        }, 1000);
      };
      
      // 添加延迟确保语音引擎就绪
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      console.error('语音合成异常:', error);
      currentWordDisplay.textContent = '朗读功能异常';
      stopDictation();
    }
  }
  
  function pauseDictation() {
    if (!isPlaying) return;
    
    isPlaying = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    clearInterval(timerInterval);
    window.speechSynthesis.pause();
  }
  
  function stopDictation() {
    if (!isPlaying && dictatedWords.length === 0) return;
    
    isPlaying = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    clearInterval(timerInterval);
    window.speechSynthesis.cancel();
    
    // 记录历史
    if (dictatedWords.length > 0) {
      const endTime = new Date();
      const duration = Math.floor((endTime - startTime) / 1000);
      const wordCount = dictatedWords.length;
      
      history.push({
        date: new Date().toLocaleString(),
        duration: formatTime(duration),
        wordCount: wordCount
      });
      
      localStorage.setItem('history', JSON.stringify(history));
      updateHistoryDisplay();
    }
    
    currentWordDisplay.textContent = '听写已结束';
  }
  
  function nextWord() {
    if (!isPlaying) return;
    
    repeatCounter = 0;
    const mode = document.getElementById('mode').value;
    
    if (mode === 'random') {
      // 从剩余单词中移除当前单词
      remainingWords.splice(currentIndex, 1);
      
      if (remainingWords.length === 0) {
        stopDictation();
        return;
      }
      
      currentIndex = Math.floor(Math.random() * remainingWords.length);
    } else {
      currentIndex++;
      
      if (currentIndex >= wordList.length) {
        stopDictation();
        return;
      }
    }
    
    currentIndexDisplay.textContent = dictatedWords.length + 1;
    speakCurrentWord();
  }
  
  function showAnswer() {
    if (dictatedWords.length === 0) {
      alert('没有可显示的单词');
      return;
    }
    
    answerSection.classList.remove('hidden');
    
    // 生成答案列表
    answerList.innerHTML = dictatedWords.map(word => `
      <div class="answer-item">
        <span class="font-bold">${word.index}.</span> 
        <span class="text-blue-600">${word.english}</span> - 
        <span class="text-green-600">${word.chinese}</span>
      </div>
    `).join('');
    
    // 显示统计信息
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000);
    summary.innerHTML = `
      <div class="text-xl mb-2">本次听写到此结束</div>
      <div class="text-lg">共听写 ${dictatedWords.length} 个单词，用时: ${formatTime(duration)}</div>
    `;
  }
  
  function updateTimer() {
    const currentTime = new Date();
    const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
    timerDisplay.textContent = formatTime(elapsedSeconds);
  }
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  function updateHistoryDisplay() {
    if (history.length === 0) {
      historyList.innerHTML = '<div class="text-center text-gray-500">暂无历史记录</div>';
      return;
    }
    
    historyList.innerHTML = history.slice().reverse().map(item => `
      <div class="p-3 border-b border-gray-200 flex justify-between">
        <span>${item.date}</span>
        <span>${item.wordCount}个单词</span>
        <span>用时: ${item.duration}</span>
      </div>
    `).join('');
  }
});
