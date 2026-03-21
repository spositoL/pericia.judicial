/**
 * CONVERSION RATE OPTIMIZATION (CRO) SYSTEM
 * Dr. Lincoln Sposito - Perícia Judicial
 * 
 * Sistema modular de otimização de conversão:
 * 1. Scroll progress indicator
 * 2. Urgency floating bar
 * 3. Exit-intent popup
 * 4. Contextual micro-CTAs
 * 5. Social proof badges
 */

class CROSystem {
    constructor(config = {}) {
        this.config = {
            whatsappNumber: '5511914612603',
            enableProgressBar: true,
            enableFloatingBar: true,
            enableExitIntent: true,
            floatingBarDelay: 10000, // 10s
            floatingBarMessage: 'Dr. Lincoln responde em até 2h',
            floatingBarUrgency: '3 slots disponíveis esta semana',
            ...config
        };

        this.exitIntentTriggered = false;
        this.init();
    }

    init() {
        if (this.config.enableProgressBar) this.setupProgressBar();
        if (this.config.enableFloatingBar) this.setupFloatingBar();
        if (this.config.enableExitIntent) this.setupExitIntent();
        this.setupMicroCTAs();
        this.setupGATracking();
    }

    /**
     * 1. PROGRESS BAR - Mostra quanto de conteúdo o usuário já viu
     */
    setupProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'cro-progress-bar';
        document.body.insertBefore(progressBar, document.body.firstChild);

        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
            progressBar.style.setProperty('--width', scrollProgress + '%');
            
            // Atualizar fill pseudo-element
            const style = getComputedStyle(progressBar);
            const afterElement = window.getComputedStyle(progressBar, '::after');
        });

        // jQuery-less version: atualizar via background-image linear-gradient
        document.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
            
            const fill = progressBar.querySelector('::after') || progressBar;
            progressBar.style.backgroundImage = `linear-gradient(90deg, #c5a059 0%, #c5a059 ${scrollProgress}%, #f0f0f0 ${scrollProgress}%, #f0f0f0 100%)`;
        });
    }

    /**
     * 2. FLOATING BAR - Mostra urgência após alguns segundos
     */
    setupFloatingBar() {
        // Criar HTML da floating bar
        const floatingBar = document.createElement('div');
        floatingBar.className = 'cro-floating-bar';
        floatingBar.innerHTML = `
            <div class="cro-floating-bar-text">
                <div>⏰ ${this.config.floatingBarMessage}</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">🎯 ${this.config.floatingBarUrgency}</div>
            </div>
            <div class="cro-floating-bar-urgency">⚡ AGENDE AGORA</div>
            <button class="cro-floating-bar-btn" onclick="CROSystem.triggerWhatsApp()">Falar Agora</button>
            <button class="cro-floating-bar-close" onclick="this.parentElement.classList.remove('show')">✕</button>
        `;
        document.body.appendChild(floatingBar);

        // Mostrar após delay
        setTimeout(() => {
            if (!floatingBar.classList.contains('show')) {
                floatingBar.classList.add('show');
            }
        }, this.config.floatingBarDelay);

        // Armazenar para uso global
        window.CROSystem = this;
    }

    /**
     * 3. EXIT-INTENT POPUP - Aparece quando mouse sai da página
     */
    setupExitIntent() {
        if (this.exitIntentTriggered) return;

        const exitPopup = document.createElement('div');
        exitPopup.className = 'cro-exit-popup';
        exitPopup.innerHTML = `
            <div class="cro-exit-popup-content">
                <button class="cro-exit-popup-close" onclick="this.closest('.cro-exit-popup').classList.remove('show')">✕</button>
                <h2 class="cro-exit-popup-title">Espera! 👋</h2>
                <p class="cro-exit-popup-subtitle">
                    Você encontrou a resposta para seu caso? Ou ainda tem dúvidas técnicas?
                </p>
                <div class="cro-exit-popup-buttons">
                    <button class="cro-exit-btn cro-exit-btn-yes" onclick="CROSystem.triggerWhatsApp('exit-intent')">
                        Tenho Interesse
                    </button>
                    <button class="cro-exit-btn cro-exit-btn-no" onclick="window.location.hash = '#faq'; this.closest('.cro-exit-popup').classList.remove('show')">
                        Ver FAQ Completo
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(exitPopup);

        // Trigger quando mouse sai da página (topo)
        document.addEventListener('mouseleave', (e) => {
            if (!this.exitIntentTriggered && e.clientY <= 0) {
                exitPopup.classList.add('show');
                this.exitIntentTriggered = true;
                
                // GA4 tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'exit_intent_popup', {
                        'event_category': 'Engagement',
                        'event_label': document.title
                    });
                }
            }
        });
    }

    /**
     * 4. MICRO-CTAs - Botões contextuais após seções importantes
     */
    setupMicroCTAs() {
        const headers = document.querySelectorAll('h2, h3');
        
        headers.forEach((header) => {
            // Inserir micro-CTA após certos headers
            const text = header.textContent.toLowerCase();
            
            // Trigger em headers estratégicos
            if (text.includes('conclus') || text.includes('próximos passos') || text.includes('viabil')) {
                const microCTA = document.createElement('div');
                microCTA.className = 'cro-micro-cta cro-animate-slide-up';
                microCTA.innerHTML = `
                    <span class="cro-micro-cta-icon">➜</span>
                    <span>Seu caso pode ter solução. Agende uma análise técnica?</span>
                `;
                microCTA.style.cursor = 'pointer';
                microCTA.addEventListener('click', () => this.triggerWhatsApp('micro-cta'));
                
                header.parentNode.insertBefore(microCTA, header.nextSibling);
            }
        });
    }

    /**
     * 5. SOCIAL PROOF BADGES - Exibir credibilidade
     */
    addSocialProof(element) {
        const badge = document.createElement('div');
        badge.className = 'cro-social-proof';
        badge.innerHTML = `
            <div class="cro-social-proof-item">
                <span class="cro-social-proof-number">42+</span>
                <span>Casos Ganhos</span>
            </div>
            <div style="width: 1px; background: #ddd;"></div>
            <div class="cro-social-proof-item">
                <span class="cro-social-proof-number">2h</span>
                <span>Tempo Médio</span>
            </div>
            <div style="width: 1px; background: #ddd;"></div>
            <div class="cro-social-proof-item">
                <span class="cro-social-proof-number">98%</span>
                <span>Aprovação</span>
            </div>
        `;
        element.insertBefore(badge, element.firstChild);
    }

    /**
     * TRIGGER WHATSAPP - Abre conversa com contexto
     */
    static triggerWhatsApp(source = 'default') {
        const messages = {
            'exit-intent': 'Olá Dr. Lincoln, vi seu conteúdo e gostaria de discutir meu caso.',
            'micro-cta': 'Olá Dr. Lincoln, preciso de uma análise técnica. Você pode ajudar?',
            'floating-bar': 'Olá Dr. Lincoln, quero agendar uma consulta prioritária.',
            'default': 'Olá Dr. Lincoln, me interessei pelo seu trabalho de perícia. Podemos falar sobre um caso que eu tenho?'
        };

        const message = encodeURIComponent(messages[source] || messages['default']);
        const whatsappURL = `https://wa.me/5511914612603?text=${message}`;
        
        window.open(whatsappURL, '_blank', 'rel=noopener noreferrer');

        // GA4 Tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'generate_lead', {
                'event_category': 'WhatsApp',
                'event_label': 'CRO System - ' + source,
                'method': 'WhatsApp',
                'value': 1.0,
                'currency': 'BRL'
            });
        }
    }

    /**
     * SETUP GA4 TRACKING - Rastrear todas as interações
     */
    setupGATracking() {
        // Rastrear cliques em todos os elementos com classe cro-*
        document.addEventListener('click', (e) => {
            if (e.target.className && e.target.className.includes('cro-')) {
                const elementClass = e.target.className;
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'cro_interaction', {
                        'event_category': 'CRO System',
                        'event_label': elementClass,
                        'interaction_type': 'click'
                    });
                }
            }
        });
    }

    /**
     * ADD URGENCY BANNER - Criar banner temporal
     */
    static addUrgencyBanner(text, slotsUsed = 3, slotsTotal = 10) {
        const banner = document.createElement('div');
        banner.className = 'cro-urgency-banner';
        banner.innerHTML = `
            ⚡ ${text} 
            <span class="cro-urgency-banner-highlight">${slotsTotal - slotsUsed} de ${slotsTotal} slots</span>
        `;
        
        // Inserir após header
        const header = document.querySelector('header') || document.querySelector('.article-header');
        if (header) {
            header.parentNode.insertBefore(banner, header.nextSibling);
        }
    }

    /**
     * ADD SCARCITY INDICATOR - Mostrar escassez visual
     */
    static addScarcityIndicator(element, used, total) {
        const scarcity = document.createElement('div');
        scarcity.className = 'cro-scarcity';
        const percentage = (used / total) * 100;
        scarcity.innerHTML = `
            <div>⏰ ${total - used} slots disponíveis esta semana</div>
            <div class="cro-scarcity-progress">
                <div class="cro-scarcity-progress-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        element.appendChild(scarcity);
    }
}

// Inicializar automaticamente ao carregar
document.addEventListener('DOMContentLoaded', () => {
    if (typeof croConfig !== 'undefined') {
        new CROSystem(croConfig);
    } else {
        // Configuração padrão
        new CROSystem({
            enableProgressBar: true,
            enableFloatingBar: true,
            enableExitIntent: true,
            floatingBarDelay: 15000 // 15 segundos
        });
    }
});
