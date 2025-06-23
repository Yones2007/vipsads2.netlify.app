// Authentication System
class AuthSystem {
    constructor() {
        this.validCodes = [
            // أكواد جديدة مع صلاحيات طويلة (سنة كاملة)
            { code: 'EDU2025X1', expiryDate: '2025-12-31', used: false },
            { code: 'EDU2025X2', expiryDate: '2025-12-31', used: false },
            { code: 'EDU2025X3', expiryDate: '2025-12-31', used: false },
            { code: 'EDU2025X4', expiryDate: '2025-12-31', used: false },
            { code: 'EDU2025X5', expiryDate: '2025-12-31', used: false },
            { code: 'EDU2025X6', expiryDate: '2025-12-31', used: false },
            { code: 'EDU2025X7', expiryDate: '2025-12-31', used: false },
            { code: 'EDU2025X8', expiryDate: '2025-12-31', used: false },
            { code: 'EDU2025X9', expiryDate: '2025-12-31', used: false },
            { code: 'EDU2025X10', expiryDate: '2025-12-31', used: false },
            
            // أكواد تجريبية
            { code: 'DEMO2025A', expiryDate: '2025-12-31', used: false },
            { code: 'DEMO2025B', expiryDate: '2025-12-31', used: false },
            { code: 'DEMO2025C', expiryDate: '2025-12-31', used: false },
            
            // أكواد خاصة بفترات محددة
            { code: 'SUMMER2025', expiryDate: '2025-09-01', used: false },
            { code: 'WINTER2025', expiryDate: '2025-03-01', used: false },
            
            // أكواد مميزة
            { code: 'VIP2025A', expiryDate: '2025-12-31', used: false },
            { code: 'VIP2025B', expiryDate: '2025-12-31', used: false },
            { code: 'VIP2025C', expiryDate: '2025-12-31', used: false },
            
            // أكواد احتياطية
            { code: 'BACKUP2025A', expiryDate: '2025-12-31', used: false },
            { code: 'BACKUP2025B', expiryDate: '2025-12-31', used: false }
        ];
        
        this.loadUsedCodes();
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    checkAuthStatus() {
        const authData = localStorage.getItem('authData');
        
        if (authData) {
            try {
                const parsedData = JSON.parse(authData);
                const currentDate = new Date();
                const expiryDate = new Date(parsedData.expiryDate);
                
                if (currentDate <= expiryDate) {
                    this.showMainApp();
                    return;
                } else {
                    localStorage.removeItem('authData');
                }
            } catch (error) {
                console.error('Error parsing auth data:', error);
            }
        }
        
        this.showLoginModal();
    }

    handleLogin() {
        const codeInput = document.getElementById('activationCode');
        const errorDiv = document.getElementById('loginError');
        const code = codeInput.value.trim().toUpperCase();

        if (!code) {
            this.showError('يرجى إدخال كود التفعيل');
            return;
        }

        const codeData = this.validCodes.find(c => c.code === code);
        
        if (!codeData) {
            this.showError('كود التفعيل غير صحيح');
            return;
        }

        if (codeData.used) {
            this.showError('تم استخدام هذا الكود من قبل');
            return;
        }

        const currentDate = new Date();
        const expiryDate = new Date(codeData.expiryDate);
        
        if (currentDate > expiryDate) {
            this.showError('انتهت صلاحية كود التفعيل');
            return;
        }

        // Mark code as used
        codeData.used = true;
        this.saveUsedCodes();

        // Calculate expiry date (30 days from activation)
        const userExpiryDate = new Date();
        userExpiryDate.setDate(userExpiryDate.getDate() + 30);

        // Save auth data
        const authData = {
            code: code,
            activationDate: currentDate.toISOString(),
            expiryDate: userExpiryDate.toISOString()
        };

        localStorage.setItem('authData', JSON.stringify(authData));
        
        this.showMainApp();
        this.showSuccessMessage('تم تسجيل الدخول بنجاح! مرحباً بك في المنصة 🎉');
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    showLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
    }

    showMainApp() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
        
        // Show welcome modal if first time
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            setTimeout(() => {
                const welcomeModal = document.getElementById('welcomeModal');
                if (welcomeModal) {
                    welcomeModal.style.display = 'flex';
                    localStorage.setItem('hasSeenWelcome', 'true');
                }
            }, 1000);
        }
    }

    logout() {
        localStorage.removeItem('authData');
        localStorage.removeItem('hasSeenWelcome');
        location.reload();
    }

    loadUsedCodes() {
        const savedCodes = localStorage.getItem('usedCodes');
        if (savedCodes) {
            try {
                const usedCodes = JSON.parse(savedCodes);
                this.validCodes.forEach(code => {
                    if (usedCodes.includes(code.code)) {
                        code.used = true;
                    }
                });
            } catch (error) {
                console.error('Error loading used codes:', error);
            }
        }
    }

    saveUsedCodes() {
        const usedCodes = this.validCodes
            .filter(c => c.used)
            .map(c => c.code);
        
        localStorage.setItem('usedCodes', JSON.stringify(usedCodes));
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: #4CAF50;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            animation: slideInRight 0.5s ease;
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.style.opacity = '0';
            setTimeout(() => {
                successDiv.remove();
            }, 500);
        }, 3000);
    }

    getRemainingDays() {
        const authData = localStorage.getItem('authData');
        if (authData) {
            try {
                const parsedData = JSON.parse(authData);
                const currentDate = new Date();
                const expiryDate = new Date(parsedData.expiryDate);
                const diffTime = expiryDate - currentDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return Math.max(0, diffDays);
            } catch (error) {
                return 0;
            }
        }
        return 0;
    }
}

// Initialize auth system
const authSystem = new AuthSystem();

// Global logout function
function logout() {
    authSystem.logout();
}

// Add CSS animation for slide in right
const authStyle = document.createElement('style');
authStyle.textContent = `
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
document.head.appendChild(authStyle);
