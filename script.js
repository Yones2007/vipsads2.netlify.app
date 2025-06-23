// Global Variables
let teachersData = [];
let currentTeacher = null;
let currentChallenge = null;
let completedLectures = JSON.parse(localStorage.getItem('completedLectures')) || [];
let currentTheme = localStorage.getItem('theme') || 'default';
let currentLecture = null;
let hlsPlayer = null;
let dashPlayer = null;

// Motivational messages for study challenges
const motivationalMessages = [
    "استمر! أنت تحقق تقدماً رائعاً 💪",
    "كل دقيقة تستثمرها في التعلم هي استثمار في مستقبلك ✨",
    "أنت على الطريق الصحيح نحو النجاح 🌟",
    "التركيز هو مفتاح الإنجاز العظيم 🔑",
    "كل خطوة تقربك من هدفك 🎯",
    "المثابرة تصنع المعجزات 🚀",
    "أنت أقوى مما تتخيل 💎",
    "النجاح يحتاج إلى صبر وعمل مستمر 🏆"
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadTeachersData();
        setupEventListeners();
        applyTheme(currentTheme);
        displayTeachers();
        updateStats();
        showWelcomeModal();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('حدث خطأ في تحميل البيانات');
    }
}

// Load teachers data from JSON
async function loadTeachersData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        const data = await response.json();
        teachersData = data.teachers;
    } catch (error) {
        console.error('Error loading teachers data:', error);
        teachersData = [];
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Theme switcher
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            switchTheme(theme);
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    if (clearSearch) {
        clearSearch.addEventListener('click', clearSearchInput);
    }

    // Challenge time buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectTimeButton(btn);
            const minutes = parseInt(btn.dataset.minutes);
            startChallenge(minutes);
        });
    });

    // Custom challenge button
    const customBtn = document.querySelector('.btn-start-custom');
    if (customBtn) {
        customBtn.addEventListener('click', startCustomChallenge);
    }

    // Challenge control buttons
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    if (pauseBtn) pauseBtn.addEventListener('click', pauseChallenge);
    if (stopBtn) stopBtn.addEventListener('click', stopChallenge);

    // Back to classes button
    const backToClassesBtn = document.getElementById('backToClasses');
    if (backToClassesBtn) {
        backToClassesBtn.addEventListener('click', () => {
            if (currentTeacher) {
                showTeacherClasses(currentTeacher.id);
            }
        });
    }

    // Video action buttons
    const markCompleteBtn = document.getElementById('markCompleteBtn');
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    
    if (markCompleteBtn) {
        markCompleteBtn.addEventListener('click', () => {
            if (currentLecture) {
                toggleLectureComplete(currentLecture.id);
            }
        });
    }
}

// Section Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the corresponding nav button
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        const btnText = btn.textContent.trim();
        if ((sectionName === 'home' && btnText.includes('الرئيسية')) ||
            (sectionName === 'lectures' && btnText.includes('المحاضرات')) ||
            (sectionName === 'challenge' && btnText.includes('التحدي'))) {
            btn.classList.add('active');
        }
    });
    
    // Reset views when switching sections
    if (sectionName === 'lectures') {
        showTeachersGrid();
    }
}

// Theme Management
function switchTheme(theme) {
    currentTheme = theme;
    applyTheme(theme);
    localStorage.setItem('theme', theme);
    
    // Update active theme button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update active theme button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const themeBtn = document.querySelector(`[data-theme="${theme}"]`);
    if (themeBtn) {
        themeBtn.classList.add('active');
    }
}

// Welcome Modal
function showWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    modal.style.display = 'none';
    localStorage.setItem('hasSeenWelcome', 'true');
}

// Display Teachers
function displayTeachers(teachers = teachersData) {
    const grid = document.getElementById('teachersGrid');
    
    if (!grid) return;
    
    if (!teachers || teachers.length === 0) {
        grid.innerHTML = '<div class="loading">جاري تحميل البيانات...</div>';
        return;
    }
    
    grid.innerHTML = teachers.map(teacher => `
        <div class="teacher-card animate-fade-in-up" onclick="showTeacherClasses(${teacher.id})">
            <img src="${teacher.image}" alt="${teacher.name}" class="teacher-avatar" 
                 onerror="this.src='https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300'">
            <h3 class="teacher-name">${teacher.name}</h3>
            <p class="teacher-subject">${teacher.subject}</p>
            <div class="teacher-stats">
                <small>${teacher.classes?.length || 0} فصل • ${getTotalLectures(teacher)} محاضرة</small>
            </div>
        </div>
    `).join('');
}

function getTotalLectures(teacher) {
    if (!teacher.classes) return 0;
    return teacher.classes.reduce((total, cls) => total + (cls.lectures?.length || 0), 0);
}

// Search Functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const clearBtn = document.getElementById('clearSearch');
    
    if (searchTerm) {
        clearBtn.style.display = 'block';
        const filteredTeachers = teachersData.filter(teacher => 
            teacher.name.toLowerCase().includes(searchTerm) ||
            teacher.subject.toLowerCase().includes(searchTerm) ||
            teacher.classes?.some(cls => 
                cls.name.toLowerCase().includes(searchTerm) ||
                cls.lectures?.some(lecture => 
                    lecture.title.toLowerCase().includes(searchTerm)
                )
            )
        );
        displayTeachers(filteredTeachers);
    } else {
        clearBtn.style.display = 'none';
        displayTeachers(teachersData);
    }
}

function clearSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    if (searchInput) {
        searchInput.value = '';
    }
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    displayTeachers(teachersData);
    if (searchInput) {
        searchInput.focus();
    }
}

// Teacher Classes Management
function showTeachersGrid() {
    const teachersGrid = document.getElementById('teachersGrid');
    const teacherClassesView = document.getElementById('teacherClassesView');
    
    if (teachersGrid) teachersGrid.style.display = 'grid';
    if (teacherClassesView) teacherClassesView.style.display = 'none';
    
    // Reset search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    const clearBtn = document.getElementById('clearSearch');
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    
    displayTeachers(teachersData);
}

function showTeacherClasses(teacherId) {
    const teacher = findTeacherById(teacherId);
    if (!teacher) return;
    
    currentTeacher = teacher;
    
    // Hide teachers grid and show classes view
    const teachersGrid = document.getElementById('teachersGrid');
    const teacherClassesView = document.getElementById('teacherClassesView');
    
    if (teachersGrid) teachersGrid.style.display = 'none';
    if (teacherClassesView) teacherClassesView.style.display = 'block';
    
    // Update teacher info
    const teacherInfoDiv = document.getElementById('currentTeacherInfo');
    if (teacherInfoDiv) {
        teacherInfoDiv.innerHTML = `
            <div class="teacher-header">
                <img src="${teacher.image}" alt="${teacher.name}" class="teacher-avatar" 
                     onerror="this.src='https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300'">
                <div class="teacher-details">
                    <h2>${teacher.name}</h2>
                    <p>${teacher.subject}</p>
                    <div class="teacher-stats">
                        <span>${teacher.classes?.length || 0} فصل</span>
                        <span>•</span>
                        <span>${getTotalLectures(teacher)} محاضرة</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Display classes
    displayClasses(teacher.classes);
}

function displayClasses(classes) {
    const container = document.getElementById('classesContainer');
    
    if (!container) return;
    
    if (!classes || classes.length === 0) {
        container.innerHTML = '<div class="no-data">لا توجد فصول متاحة</div>';
        return;
    }
    
    container.innerHTML = classes.map((cls, index) => `
        <div class="class-card animate-fade-in-up">
            <div class="class-header" onclick="toggleLectures(${index})">
                <div>
                    <h3 class="class-title">${cls.name}</h3>
                    <p class="class-info">${cls.lectures?.length || 0} محاضرة • ${getCompletedCount(cls.lectures, index)} مكتملة</p>
                </div>
                <i class="fas fa-chevron-down class-toggle" id="toggle-${index}"></i>
            </div>
            <div class="lectures-list" id="lectures-${index}">
                ${displayLectures(cls.lectures, index)}
            </div>
        </div>
    `).join('');
}

function displayLectures(lectures, classIndex) {
    if (!lectures || lectures.length === 0) {
        return '<div class="no-lectures">لا توجد محاضرات متاحة</div>';
    }
    
    return lectures.map((lecture, lectureIndex) => {
        const lectureId = `${currentTeacher.id}-${classIndex}-${lectureIndex}`;
        const isCompleted = completedLectures.includes(lectureId);
        
        return `
            <div class="lecture-item" onclick="playLecture('${lecture.url}', '${lecture.title}', '${lecture.description}', '${lectureId}')">
                <div class="lecture-content">
                    <h4 class="lecture-title">${lecture.title}</h4>
                    <p class="lecture-description">${lecture.description}</p>
                </div>
                <div class="lecture-checkbox ${isCompleted ? 'completed' : ''}" 
                     onclick="event.stopPropagation(); toggleLectureComplete('${lectureId}')">
                    ${isCompleted ? '<i class="fas fa-check"></i>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function toggleLectures(classIndex) {
    const lecturesList = document.getElementById(`lectures-${classIndex}`);
    const toggle = document.getElementById(`toggle-${classIndex}`);
    
    if (lecturesList && toggle) {
        lecturesList.classList.toggle('active');
        toggle.style.transform = lecturesList.classList.contains('active') 
            ? 'rotate(180deg)' 
            : 'rotate(0deg)';
    }
}

function getCompletedCount(lectures, classIndex) {
    if (!lectures || !currentTeacher) return 0;
    return lectures.filter((_, lectureIndex) => {
        const lectureId = `${currentTeacher.id}-${classIndex}-${lectureIndex}`;
        return completedLectures.includes(lectureId);
    }).length;
}

// Lecture Completion Management
function toggleLectureComplete(lectureId) {
    if (completedLectures.includes(lectureId)) {
        completedLectures = completedLectures.filter(id => id !== lectureId);
        showSuccessMessage('تم إلغاء تسجيل المحاضرة كمكتملة');
    } else {
        completedLectures.push(lectureId);
        showSuccessMessage('تم تسجيل المحاضرة كمكتملة! 🎉');
    }
    
    localStorage.setItem('completedLectures', JSON.stringify(completedLectures));
    
    // Refresh the display
    if (currentTeacher) {
        displayClasses(currentTeacher.classes);
    }
    
    updateStats();
    
    // Update video page button if we're on video page
    updateVideoCompleteButton(lectureId);
}

function updateVideoCompleteButton(lectureId) {
    const markCompleteBtn = document.getElementById('markCompleteBtn');
    if (markCompleteBtn && currentLecture && currentLecture.id === lectureId) {
        const isCompleted = completedLectures.includes(lectureId);
        markCompleteBtn.innerHTML = isCompleted 
            ? '<i class="fas fa-check"></i> مكتملة' 
            : '<i class="fas fa-check"></i> تسجيل كمكتملة';
        markCompleteBtn.style.background = isCompleted ? 'var(--success-color)' : 'var(--primary-color)';
    }
}

// Advanced Video Player with support for all formats
function playLecture(url, title, description, lectureId) {
    currentLecture = { url, title, description, id: lectureId };
    
    // Show video section
    showSection('video');
    
    // Clean up any existing players
    if (hlsPlayer) {
        hlsPlayer.destroy();
        hlsPlayer = null;
    }
    
    if (dashPlayer) {
        dashPlayer.destroy();
        dashPlayer = null;
    }
    
    // Update video player
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer) {
        videoPlayer.innerHTML = `
            <div class="video-container">
                <video id="main-video" controls autoplay playsinline style="width:100%; height:100%; background:#000;"></video>
                <div class="video-loading" style="display:none;">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>جاري تحميل الفيديو...</p>
                </div>
                <div class="video-error" style="display:none;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p class="error-message"></p>
                </div>
            </div>
        `;
        
        const videoElement = document.getElementById('main-video');
        const loadingElement = document.querySelector('.video-loading');
        const errorElement = document.querySelector('.video-error');
        const errorMessage = document.querySelector('.error-message');
        
        // Reset elements
        loadingElement.style.display = 'none';
        errorElement.style.display = 'none';
        videoElement.style.display = 'block';
        
        // Function to show error
        const showError = (message) => {
            errorMessage.textContent = message;
            errorElement.style.display = 'flex';
            videoElement.style.display = 'none';
            loadingElement.style.display = 'none';
        };
        
        // Function to initialize HLS
        const initHls = (hlsUrl) => {
            if (!window.Hls) {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
                script.onload = () => startHlsPlayback(hlsUrl);
                script.onerror = () => showError('فشل تحميل مشغل الفيديو');
                document.head.appendChild(script);
            } else {
                startHlsPlayback(hlsUrl);
            }
        };
        
        // Function to start HLS playback
        const startHlsPlayback = (hlsUrl) => {
            if (Hls.isSupported()) {
                loadingElement.style.display = 'flex';
                
                hlsPlayer = new Hls();
                hlsPlayer.loadSource(hlsUrl);
                hlsPlayer.attachMedia(videoElement);
                
                hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
                    loadingElement.style.display = 'none';
                    videoElement.play().catch(e => {
                        showError('اضغط لتشغيل الفيديو');
                        errorElement.onclick = () => videoElement.play();
                    });
                });
                
                hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch(data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                showError('خطأ في الشبكة، يرجى المحاولة لاحقاً');
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                showError('خطأ في تحميل الفيديو');
                                break;
                            default:
                                showError('خطأ في تشغيل الفيديو');
                        }
                    }
                });
            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support for Safari
                videoElement.src = hlsUrl;
                videoElement.addEventListener('loadedmetadata', () => {
                    videoElement.play().catch(e => {
                        showError('اضغط لتشغيل الفيديو');
                        errorElement.onclick = () => videoElement.play();
                    });
                });
            } else {
                showError('المتصفح لا يدعم تشغيل هذا النوع من الفيديو');
            }
        };
        
        // Function to initialize MPEG-DASH
        const initDash = (dashUrl) => {
            if (!window.dashjs) {
                const script = document.createElement('script');
                script.src = 'https://cdn.dashjs.org/latest/dash.all.min.js';
                script.onload = () => startDashPlayback(dashUrl);
                script.onerror = () => showError('فشل تحميل مشغل الفيديو');
                document.head.appendChild(script);
            } else {
                startDashPlayback(dashUrl);
            }
        };
        
        // Function to start DASH playback
        const startDashPlayback = (dashUrl) => {
            loadingElement.style.display = 'flex';
            
            dashPlayer = dashjs.MediaPlayer().create();
            dashPlayer.initialize(videoElement, dashUrl, true);
            
            dashPlayer.on(dashjs.MediaPlayer.events.PLAYBACK_LOADED, () => {
                loadingElement.style.display = 'none';
                videoElement.play().catch(e => {
                    showError('اضغط لتشغيل الفيديو');
                    errorElement.onclick = () => videoElement.play();
                });
            });
            
            dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (e) => {
                showError('خطأ في تحميل الفيديو');
            });
        };
        
        // Determine video type and initialize appropriate player
        if (url.match(/\.(mp4|webm|ogg)$/i)) {
            // Standard video formats
            videoElement.src = url;
            videoElement.addEventListener('error', () => {
                showError('لا يمكن تحميل الفيديو');
            });
            
            videoElement.play().catch(e => {
                showError('اضغط لتشغيل الفيديو');
                errorElement.onclick = () => videoElement.play();
            });
        } 
        else if (url.match(/\.(m3u8)$/i)) {
            // HLS Stream
            initHls(url);
        }
        else if (url.match(/\.(mpd)$/i)) {
            // MPEG-DASH Stream
            initDash(url);
        }
        else if (url.match(/youtube\.com|youtu\.be/i)) {
            // YouTube videos - Basic embed solution
            videoPlayer.innerHTML = `
                <div class="youtube-placeholder" style="text-align:center; padding:2rem;">
                    <i class="fab fa-youtube" style="font-size:3rem; color:red;"></i>
                    <p style="margin-top:1rem; font-size:1.2rem;">محتوى يوتيوب - يمكنك مشاهدته على الموقع الرسمي</p>
                </div>
            `;
        }
        else {
            // Unsupported format
            showError('نوع الفيديو غير مدعوم');
        }
    }
    
    // Update video info
    const videoInfo = document.getElementById('videoInfo');
    if (videoInfo) {
        videoInfo.innerHTML = `
            <h2>${title}</h2>
            <p>${description}</p>
            <div class="lecture-meta">
                <p><strong>المدرس:</strong> ${currentTeacher ? currentTeacher.name : ''}</p>
                <p><strong>المادة:</strong> ${currentTeacher ? currentTeacher.subject : ''}</p>
            </div>
        `;
    }
    
    // Update complete button
    updateVideoCompleteButton(lectureId);
}

// ... (بقية الدوال تبقى كما هي بدون تغيير)

// Study Challenge System
function selectTimeButton(selectedBtn) {
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    selectedBtn.classList.add('active');
}

function startChallenge(minutes) {
    if (currentChallenge) {
        stopChallenge();
    }
    
    const totalSeconds = minutes * 60;
    currentChallenge = {
        totalSeconds: totalSeconds,
        remainingSeconds: totalSeconds,
        isPaused: false,
        startTime: Date.now()
    };
    
    const challengeSetup = document.getElementById('challengeSetup');
    const challengeActive = document.getElementById('challengeActive');
    
    if (challengeSetup) challengeSetup.style.display = 'none';
    if (challengeActive) challengeActive.style.display = 'block';
    
    updateTimer();
    currentChallenge.interval = setInterval(updateTimer, 1000);
    
    showSuccessMessage(`بدأ التحدي! ${minutes} دقيقة من التركيز 🎯`);
}

function startCustomChallenge() {
    const customMinutes = parseInt(document.getElementById('customMinutes').value);
    
    if (!customMinutes || customMinutes < 1 || customMinutes > 600) {
        alert('يرجى إدخال عدد دقائق صحيح (1-600)');
        return;
    }
    
    startChallenge(customMinutes);
}

function updateTimer() {
    if (!currentChallenge || currentChallenge.isPaused) return;
    
    const timeDisplay = document.getElementById('timeRemaining');
    const progressCircle = document.getElementById('timerProgress');
    const messagesDiv = document.getElementById('motivationalMessages');
    
    if (!timeDisplay) return;
    
    const minutes = Math.floor(currentChallenge.remainingSeconds / 60);
    const seconds = currentChallenge.remainingSeconds % 60;
    
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress circle
    if (progressCircle) {
        const progress = (currentChallenge.totalSeconds - currentChallenge.remainingSeconds) / currentChallenge.totalSeconds;
        const circumference = 2 * Math.PI * 90; // radius = 90
        const offset = circumference * (1 - progress);
        progressCircle.style.strokeDashoffset = offset;
    }
    
    // Show motivational messages
    if (messagesDiv && currentChallenge.remainingSeconds % 300 === 0 && currentChallenge.remainingSeconds > 0) {
        const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        messagesDiv.innerHTML = `<p>${randomMessage}</p>`;
    }
    
    currentChallenge.remainingSeconds--;
    
    if (currentChallenge.remainingSeconds < 0) {
        completeChallenge();
    }
}

function pauseChallenge() {
    if (!currentChallenge) return;
    
    const pauseBtn = document.getElementById('pauseBtn');
    if (!pauseBtn) return;
    
    if (currentChallenge.isPaused) {
        currentChallenge.isPaused = false;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> إيقاف مؤقت';
    } else {
        currentChallenge.isPaused = true;
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> متابعة';
    }
}

function stopChallenge() {
    if (currentChallenge && currentChallenge.interval) {
        clearInterval(currentChallenge.interval);
    }
    
    currentChallenge = null;
    
    const challengeSetup = document.getElementById('challengeSetup');
    const challengeActive = document.getElementById('challengeActive');
    
    if (challengeSetup) challengeSetup.style.display = 'block';
    if (challengeActive) challengeActive.style.display = 'none';
    
    // Reset time buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    showSuccessMessage('تم إنهاء التحدي');
}

function completeChallenge() {
    if (currentChallenge && currentChallenge.interval) {
        clearInterval(currentChallenge.interval);
    }
    
    const messagesDiv = document.getElementById('motivationalMessages');
    if (messagesDiv) {
        messagesDiv.innerHTML = `
            <p style="font-size: 1.2rem;">🎉 أحسنت! لقد أكملت التحدي بنجاح! 🎉</p>
            <p>استمر في هذا الإنجاز الرائع!</p>
        `;
    }
    
    setTimeout(() => {
        stopChallenge();
    }, 5000);
}

// Update Statistics
function updateStats() {
    const teacherCount = teachersData.length;
    const classCount = teachersData.reduce((total, teacher) => total + (teacher.classes?.length || 0), 0);
    const lectureCount = teachersData.reduce((total, teacher) => 
        total + getTotalLectures(teacher), 0);
    
    animateNumber('teacherCount', teacherCount);
    animateNumber('classCount', classCount);
    animateNumber('lectureCount', lectureCount);
    
    // Update footer stats
    const completedLecturesSpan = document.getElementById('completedLectures');
    if (completedLecturesSpan) {
        completedLecturesSpan.textContent = completedLectures.length;
    }
}

function animateNumber(elementId, targetNumber) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let currentNumber = 0;
    const increment = targetNumber / 30; // 30 frames
    
    const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= targetNumber) {
            currentNumber = targetNumber;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentNumber);
    }, 50);
}

// Utility Functions
function findTeacherById(id) {
    return teachersData.find(teacher => teacher.id === id);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${message}
    `;
    errorDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: var(--error-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-heavy);
        z-index: 1001;
        animation: slideInRight 0.5s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: var(--success-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-heavy);
        z-index: 1001;
        animation: slideInRight 0.5s ease;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Add CSS animation for slide in right
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);

// Handle window resize for responsive design
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
});

// Initialize stats animation on scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
        }
    });
}, observerOptions);

// Observe elements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelectorAll('.teacher-card, .class-card, .feature-card').forEach(el => {
            observer.observe(el);
        });
    }, 1000);
});
