// Interatividade para FAQ
document.addEventListener('DOMContentLoaded', function() {
    // Interatividade para FAQ
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = question.parentElement;
            faqItem.classList.toggle('active');
        });
    });

    // Abrir primeira FAQ por padrão
    const firstFaqItem = document.querySelector('.faq-item');
    if (firstFaqItem) {
        firstFaqItem.classList.add('active');
    }

    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Animação ao scroll para stat cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.stat-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 600ms ease, transform 600ms ease';
        observer.observe(card);
    });

    // Animação para timeline items ao fazer scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `opacity 500ms ease ${index * 50}ms, transform 500ms ease ${index * 50}ms`;
        
        const itemObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        itemObserver.observe(item);
    });
});
async function geocode(endereco) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.length === 0) return null;

    return {
        lat: data[0].lat,
        lon: data[0].lon
    };
}

async function calcularRota(origem, destino) {
    const url = `https://router.project-osrm.org/route/v1/driving/${origem.lon},${origem.lat};${destino.lon},${destino.lat}?overview=false`;

    const res = await fetch(url);
    const data = await res.json();

    const rota = data.routes[0];

    return {
        distancia_km: rota.distance / 1000,
        duracao_min: rota.duration / 60
    };
}

function calcularPreco(distancia, multiplicador) {
    const precoBase = 2.00;
    const precoPorKm = 0.40;

    return precoBase + (precoPorKm * distancia) * multiplicador;
}

async function simular() {
    const origemTxt = document.getElementById("origem").value;
    const destinoTxt = document.getElementById("destino").value;
    const resultado = document.getElementById("resultado");

    resultado.innerHTML = "Calculando...";

    const origem = await geocode(origemTxt);
    const destino = await geocode(destinoTxt);

    if (!origem || !destino) {
        resultado.innerHTML = "Erro: não foi possível localizar os endereços.";
        return;
    }

    const rota = await calcularRota(origem, destino);

    const multiplicador = (1 + Math.random() * 0.5).toFixed(2);

    const preco = calcularPreco(rota.distancia_km, multiplicador);

    resultado.innerHTML = `
        <h3>Resultado da Corrida</h3>
        <p><strong>Distância:</strong> ${rota.distancia_km.toFixed(2)} km</p>
        <p><strong>Tempo estimado:</strong> ${rota.duracao_min.toFixed(0)} min</p>
        <p><strong>Preço dinâmico:</strong> x${multiplicador}</p>
        <p><strong>Preço Final:</strong> R$ ${preco.toFixed(2)}</p>
    `;
}
