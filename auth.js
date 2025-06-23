// Authentication System
class AuthSystem {
    constructor() {
        this.validCodes = [
            { code: 'EDU2025A', expiryDate: '2025-02-15', used: false },
            { code: 'EDU2025B', expiryDate: '2025-02-15', used: false },
            { code: 'EDU2025C', expiryDate: '2025-02-15', used: false },
            { code: 'EDU2025D', expiryDate: '2025-02-15', used: false },
            { code: 'EDU2025E', expiryDate: '2025-02-15', used: false },
            { code: 'DEMO2025', expiryDate: '2025-12-31', used: false }, // Demo code
            
            // 14 كود إضافي
            { code: 'EDU2025F', expiryDate: '2025-03-20', used: false },
            { code: 'EDU2025G', expiryDate: '2025-03-20', used: false },
            { code: 'EDU2025H', expiryDate: '2025-03-20', used: false },
            { code: 'EDU2025J', expiryDate: '2025-03-20', used: false },
            { code: 'EDU2025K', expiryDate: '2025-04-10', used: false },
            { code: 'EDU2025L', expiryDate: '2025-04-10', used: false },
            { code: 'EDU2025M', expiryDate: '2025-04-10', used: false },
            { code: 'EDU2025N', expiryDate: '2025-05-05', used: false },
            { code: 'EDU2025P', expiryDate: '2025-05-05', used: false },
            { code: 'EDU2025Q', expiryDate: '2025-05-05', used: false },
            { code: 'EDU2025R', expiryDate: '2025-06-15', used: false },
            { code: 'EDU2025S', expiryDate: '2025-06-15', used: false },
            { code: 'EDU2025T', expiryDate: '2025-06-15', used: false },
            { code: 'EDU2025U', expiryDate: '2025-07-01', used: false },
            { code: 'EDU2025V', expiryDate: '2025-07-01', used: false }
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
                usedCodes.forEach(usedCode => {
                    const codeData = this.validCodes.find(c => c.code === usedCode);
                    if (codeData) {
                        codeData.used = true;
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
