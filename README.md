<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Curso Gratuito de Marketing Digital: 3 Módulos Essenciais</title>
    <meta name="description" content="Aprenda as estratégias de marketing digital que realmente funcionam. Curso 100% gratuito e online, com foco em resultados práticos. Inscreva-se agora!">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome (Ícones) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    
    <!-- AOS (Animate On Scroll) Library -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    
    <!-- Configuração de Cores Personalizadas (para facilitar a identificação dos módulos) -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary-blue': '#3B82F6', // Azul (Confiança)
                        'accent-amber': '#FBBF24', // Amarelo/Laranja (CTA/Destaque)
                        'module-1': '#93C5FD', // Light Blue
                        'module-2': '#34D399', // Emerald Green
                        'module-3': '#F87171', // Red/Rose
                    }
                }
            }
        }
    </script>
    
    <!-- Estilo customizado para um pattern sutil -->
    <style>
        .subtle-pattern {
            background-color: #f9fafb;
            background-image: radial-gradient(#d1d5db 1px, transparent 0);
            background-size: 40px 40px;
        }
    </style>
</head>

<body class="bg-gray-50 text-gray-800 antialiased">

    <!-- Header Simples -->
    <header class="sticky top-0 z-50 bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <a href="#hero" class="text-2xl font-bold text-primary-blue hover:text-blue-700 transition duration-300" aria-label="Página Inicial">
                Marketing <span class="text-accent-amber">Pro</span>
            </a>
            <a href="#inscricao" class="hidden sm:inline-block bg-accent-amber hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">
                Inscreva-se Grátis
            </a>
            <button class="sm:hidden text-gray-700 text-xl focus:outline-none" aria-label="Menu Mobile">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </header>

    <!-- 1. Seção Hero (A Promessa) -->
    <section id="hero" class="pt-16 pb-20 lg:pt-24 lg:pb-32 bg-white subtle-pattern">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            
            <!-- Texto Principal -->
            <div data-aos="fade-right">
                <span class="inline-block bg-accent-amber text-white text-sm font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider shadow-lg">100% GRATUITO E ONLINE</span>
                
                <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 mb-6">
                    Domine o Marketing Digital com Nosso Curso <span class="text-primary-blue">Essencial</span>
                </h1>
                
                <p class="text-lg sm:text-xl text-gray-600 mb-8 max-w-lg">
                    Pare de adivinhar. Receba o mapa completo de 3 módulos para gerar leads, criar conteúdo que vende e escalar seu negócio online.
                </p>

                <!-- CTA Principal -->
                <a href="#inscricao" class="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-2xl text-gray-900 bg-accent-amber hover:bg-amber-600 transform hover:scale-[1.02] transition duration-300 ease-in-out ring-4 ring-amber-300">
                    QUERO ME INSCREVER AGORA (É GRÁTIS!)
                    <i class="fas fa-arrow-right ml-3"></i>
                </a>
                
                <div class="mt-6 text-sm text-gray-500 flex items-center">
                    <i class="fas fa-users text-primary-blue mr-2"></i>
                    Junte-se a mais de 15.000 alunos que já transformaram seus resultados.
                </div>
            </div>

            <!-- Imagem / Formulário Rápido (Desktop) -->
            <div class="hidden lg:block bg-white p-8 rounded-xl shadow-2xl border border-gray-100" data-aos="fade-left">
                 <h3 class="text-2xl font-bold text-center text-primary-blue mb-4">Acesso Imediato e Gratuito</h3>
                 <form id="hero-form" class="space-y-4">
                    <div>
                        <label for="hero-nome" class="sr-only">Seu Nome</label>
                        <input type="text" id="hero-nome" placeholder="Seu Nome Completo" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" aria-label="Seu Nome">
                    </div>
                    <div>
                        <label for="hero-email" class="sr-only">Seu Melhor E-mail</label>
                        <input type="email" id="hero-email" placeholder="Seu Melhor E-mail" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" aria-label="Seu Melhor E-mail">
                    </div>
                    <button type="submit" class="w-full bg-primary-blue text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md">
                        Começar o Curso Agora
                    </button>
                    <p class="text-xs text-center text-gray-500 mt-2">Seus dados estão seguros. Não enviamos spam.</p>
                </form>
            </div>

        </div>
    </section>

    <!-- Prova Social (Credibilidade) -->
    <section class="py-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="zoom-in">
            <h2 class="text-xl font-semibold text-gray-500 mb-6 uppercase tracking-wider">
                Reconhecido por quem entende de resultados:
            </h2>
            <div class="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-75">
                <!-- Logos Simbólicos -->
                <i class="fab fa-google text-4xl text-blue-600"></i>
                <i class="fab fa-facebook text-4xl text-indigo-600"></i>
                <span class="text-3xl font-bold text-gray-700">Expert.com</span>
                <span class="text-3xl font-bold text-green-600">GrowUp</span>
                <i class="fas fa-trophy text-4xl text-accent-amber"></i>
            </div>
        </div>
    </section>

    <!-- 2. Seção de Conteúdo (Os 3 Módulos) -->
    <section id="conteudo" class="py-20 lg:py-28 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4" data-aos="fade-down">
                    O Que Você Vai Aprender <span class="text-accent-amber">Sem Pagar Nada?</span>
                </h2>
                <p class="text-lg text-gray-600 max-w-3xl mx-auto" data-aos="fade-down" data-aos-delay="100">
                    Dividimos o conhecimento em 3 pilares essenciais para garantir que você saia da teoria e vá direto para a prática lucrativa.
                </p>
            </div>

            <!-- Grid dos Módulos -->
            <div class="grid md:grid-cols-3 gap-8">
                
                <!-- Módulo 1: Fundamentos -->
                <div class="p-6 md:p-8 rounded-xl shadow-lg border-t-8 border-module-1 bg-white hover:shadow-xl transition duration-500 transform hover:-translate-y-1" data-aos="fade-up">
                    <div class="flex items-center justify-center w-12 h-12 rounded-full bg-module-1/20 text-module-1 mb-4">
                        <i class="fas fa-lightbulb text-2xl"></i>
                    </div>
                    <span class="text-sm font-bold text-module-1 uppercase">Módulo 1</span>
                    <h3 class="text-2xl font-bold text-gray-900 my-2">
                        A Fundação Inabalável
                    </h3>
                    <p class="text-gray-600 mb-4">
                        Entenda como funciona a mentalidade do marketing moderno.
                    </p>
                    <ul class="space-y-3 text-gray-700">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-module-1 mt-1 mr-2 flex-shrink-0"></i>
                            Definição de Persona e Nicho de Mercado.
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-module-1 mt-1 mr-2 flex-shrink-0"></i>
                            Mapeamento da Jornada do Cliente (AIDA).
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-module-1 mt-1 mr-2 flex-shrink-0"></i>
                            Ferramentas Essenciais e Configuração inicial.
                        </li>
                    </ul>
                </div>

                <!-- Módulo 2: Estratégias de Conteúdo -->
                <div class="p-6 md:p-8 rounded-xl shadow-lg border-t-8 border-module-2 bg-white hover:shadow-xl transition duration-500 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="200">
                    <div class="flex items-center justify-center w-12 h-12 rounded-full bg-module-2/20 text-module-2 mb-4">
                        <i class="fas fa-chart-line text-2xl"></i>
                    </div>
                    <span class="text-sm font-bold text-module-2 uppercase">Módulo 2</span>
                    <h3 class="text-2xl font-bold text-gray-900 my-2">
                        Geração de Tráfego Magnético
                    </h3>
                    <p class="text-gray-600 mb-4">
                        Táticas comprovadas para atrair visitantes qualificados sem gastar rios de dinheiro.
                    </p>
                    <ul class="space-y-3 text-gray-700">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-module-2 mt-1 mr-2 flex-shrink-0"></i>
                            SEO Básico: Apareça no Google de graça.
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-module-2 mt-1 mr-2 flex-shrink-0"></i>
                            Conteúdo Viral para Redes Sociais (Fórmulas).
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-module-2 mt-1 mr-2 flex-shrink-0"></i>
                            Criação de Ímãs de Leads (Lead Magnets) de alta conversão.
                        </li>
                    </ul>
                </div>

                <!-- Módulo 3: Conversão e Vendas -->
                <div class="p-6 md:p-8 rounded-xl shadow-lg border-t-8 border-module-3 bg-white hover:shadow-xl transition duration-500 transform hover:-translate-y-1" data-aos="fade-up" data-aos-delay="400">
                    <div class="flex items-center justify-center w-12 h-12 rounded-full bg-module-3/20 text-module-3 mb-4">
                        <i class="fas fa-dollar-sign text-2xl"></i>
                    </div>
                    <span class="text-sm font-bold text-module-3 uppercase">Módulo 3</span>
                    <h3 class="text-2xl font-bold text-gray-900 my-2">
                        Otimização e Vendas Rápidas
                    </h3>
                    <p class="text-gray-600 mb-4">
                        Transforme visitantes em clientes pagantes utilizando automação e persuasão.
                    </p>
                    <ul class="space-y-3 text-gray-700">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-module-3 mt-1 mr-2 flex-shrink-0"></i>
                            Estrutura de Landing Pages que Convertem 3x mais.
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-module-3 mt-1 mr-2 flex-shrink-0"></i>
                            Sequências de E-mail Marketing para Vendas.
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-module-3 mt-1 mr-2 flex-shrink-0"></i>
                            Análise de Métricas Simples (KPIs de Sucesso).
                        </li>
                    </ul>
                </div>
            </div>

             <div class="text-center mt-12" data-aos="zoom-in" data-aos-delay="500">
                <a href="#inscricao" class="inline-flex justify-center items-center px-10 py-4 text-xl font-bold rounded-xl shadow-lg text-white bg-primary-blue hover:bg-blue-700 transition duration-300 transform hover:scale-105">
                    Sim, eu quero os 3 Módulos de Graça!
                    <i class="fas fa-angle-double-right ml-3"></i>
                </a>
            </div>
        </div>
    </section>
    
    <!-- Seção de Benefícios e Contra-Argumentos -->
    <section class="py-20 bg-gray-100">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="text-3xl font-bold text-center text-gray-900 mb-10" data-aos="fade-down">
                Por que este curso é o ideal para você?
            </h2>
            
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Benefício 1 -->
                <div class="flex items-start space-x-4 p-4" data-aos="fade-right">
                    <i class="fas fa-rocket text-4xl text-accent-amber mt-1 flex-shrink-0"></i>
                    <div>
                        <h4 class="text-xl font-semibold text-gray-900">Foco em Ação Rápida</h4>
                        <p class="text-gray-600">Conteúdo direto ao ponto. Implemente hoje mesmo e veja os primeiros resultados na próxima semana.</p>
                    </div>
                </div>
                
                <!-- Benefício 2 -->
                <div class="flex items-start space-x-4 p-4" data-aos="fade-left">
                    <i class="fas fa-handshake text-4xl text-primary-blue mt-1 flex-shrink-0"></i>
                    <div>
                        <h4 class="text-xl font-semibold text-gray-900">Zero Custo</h4>
                        <p class="text-gray-600">É totalmente gratuito. Não pedimos cartão, apenas seu nome e e-mail para acesso imediato.</p>
                    </div>
                </div>
                
                <!-- Benefício 3 -->
                <div class="flex items-start space-x-4 p-4" data-aos="fade-right" data-aos-delay="200">
                    <i class="fas fa-laptop-code text-4xl text-module-2 mt-1 flex-shrink-0"></i>
                    <div>
                        <h4 class="text-xl font-semibold text-gray-900">Certificado de Conclusão</h4>
                        <p class="text-gray-600">Ao finalizar os 3 módulos, você recebe um certificado digital para enriquecer seu currículo.</p>
                    </div>
                </div>
                
                <!-- Benefício 4 -->
                <div class="flex items-start space-x-4 p-4" data-aos="fade-left" data-aos-delay="200">
                    <i class="fas fa-mobile-alt text-4xl text-module-3 mt-1 flex-shrink-0"></i>
                    <div>
                        <h4 class="text-xl font-semibold text-gray-900">Acesso Flexível</h4>
                        <p class="text-gray-600">Assista onde e quando quiser, em seu computador, tablet ou celular. O curso é seu para sempre.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 3. Seção de CTA Final e Formulário de Inscrição -->
    <section id="inscricao" class="py-20 lg:py-28 bg-primary-blue">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div class="text-center mb-12" data-aos="fade-up">
                <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
                    Seu Próximo Nível Começa Aqui.
                </h2>
                <p class="text-xl opacity-90">
                    Aproveite esta oportunidade única. O acesso é liberado em menos de 1 minuto!
                </p>
                <div class="mt-4 flex justify-center items-center space-x-4">
                    <span class="text-accent-amber font-bold text-lg"><i class="fas fa-lock mr-2"></i> Cadastro 100% Seguro.</span>
                </div>
            </div>
            
            <!-- Formulário de Inscrição -->
            <div class="bg-white p-6 sm:p-10 rounded-xl shadow-2xl" data-aos="zoom-in" data-aos-delay="100">
                <form id="main-form" class="space-y-6">
                    <div>
                        <label for="nome" class="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                        <input type="text" id="nome" placeholder="Seu Nome" required class="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-accent-amber focus:border-accent-amber text-gray-900" aria-label="Nome Completo">
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">E-mail de Acesso</label>
                        <input type="email" id="email" placeholder="Seu Melhor E-mail" required class="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-accent-amber focus:border-accent-amber text-gray-900" aria-label="E-mail de Acesso">
                    </div>
                    
                    <button type="submit" class="w-full inline-flex justify-center items-center px-6 py-4 border border-transparent text-xl font-bold rounded-xl shadow-xl text-gray-900 bg-accent-amber hover:bg-amber-600 transition duration-300 transform hover:scale-[1.01]">
                        SIM! QUERO ME INSCREVER DE GRAÇA
                        <i class="fas fa-check-circle ml-3"></i>
                    </button>

                    <p id="success-message" class="text-center text-green-600 font-semibold mt-4 hidden" role="alert">
                        Inscrição realizada com sucesso! Verifique seu e-mail para receber o acesso.
                    </p>
                    
                    <p class="text-xs text-center text-gray-500 mt-4">
                        Ao se inscrever, você concorda com nossos Termos de Uso e Política de Privacidade.
                    </p>
                </form>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
            <p>&copy; 2024 Marketing Pro. Todos os direitos reservados.</p>
            <div class="mt-2 space-x-4">
                <a href="#" class="hover:text-primary-blue transition duration-300">Termos de Uso</a>
                <span class="text-gray-600">|</span>
                <a href="#" class="hover:text-primary-blue transition duration-300">Política de Privacidade</a>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        // Inicialização do AOS (Animate On Scroll)
        AOS.init({
            duration: 800,
            once: true, // Animar apenas uma vez
            offset: 50, // Ponto de acionamento
        });

        // Simulação de Submissão do Formulário
        document.addEventListener('DOMContentLoaded', () => {
            const forms = [
                document.getElementById('main-form'),
                document.getElementById('hero-form')
            ].filter(f => f !== null);

            const successMessage = document.getElementById('success-message');

            forms.forEach(form => {
                form.addEventListener('submit', function(event) {
                    event.preventDefault();
                    
                    // Em um ambiente real, você enviaria os dados para um backend aqui.
                    const nomeInput = form.querySelector('input[type="text"]');
                    const emailInput = form.querySelector('input[type="email"]');

                    console.log('Formulário submetido:', {
                        nome: nomeInput ? nomeInput.value : 'N/A',
                        email: emailInput ? emailInput.value : 'N/A'
                    });

                    // Simula o sucesso
                    if (form.id === 'main-form' && successMessage) {
                        form.style.display = 'none'; // Esconde o formulário
                        successMessage.classList.remove('hidden'); // Mostra a mensagem de sucesso
                        // Rola para a mensagem de sucesso
                        document.getElementById('inscricao').scrollIntoView({ behavior: 'smooth' });
                    } else {
                        // Caso seja o hero-form
                        alert('Inscrição realizada com sucesso! Verifique seu e-mail para receber o acesso.');
                        form.reset();
                    }
                });
            });
        });
    </script>
</body>
</html>
