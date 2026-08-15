document.addEventListener('DOMContentLoaded', () => {
    // Configuración
    const WHATSAPP_PHONE = '18097651290';
    
    // Elementos del DOM
    const offerCards = document.querySelectorAll('.offer-card');
    const radios = document.querySelectorAll('.offer-radio');
    const inputQty = document.getElementById('input-qty');
    const inputTotal = document.getElementById('input-total');
    const clientQtySelect = document.getElementById('client-quantity');
    
    const summaryQty = document.getElementById('summary-qty');
    const summaryTotal = document.getElementById('summary-total');
    
    const orderForm = document.getElementById('order-form');
    
    // Modal Elementos
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const openModalButtons = document.querySelectorAll('a[href="#formulario"]');
    
    // Funciones del Modal
    function openModal(e) {
        if(e) e.preventDefault();
        checkoutModal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Disparar evento InitiateCheckout de Meta Pixel
        if (typeof fbq === 'function') {
            const currentTotal = parseInt(document.getElementById('input-total').value) || 0;
            if (currentTotal > 0) {
                fbq('track', 'InitiateCheckout', {
                    value: currentTotal,
                    currency: 'DOP'
                });
            } else {
                fbq('track', 'InitiateCheckout');
            }
        }
        
        // No auto-initialize values; they will be set when the user selects an offer.
        // Auto-focus on the name field after the modal opens (will be triggered after selection).
        setTimeout(() => {
            // Focus is handled after an offer is selected.
        }, 0);
    }
    
    function closeModal() {
        checkoutModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    // Event Listeners para Modal
    openModalButtons.forEach(btn => {
        btn.addEventListener('click', openModal);
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    
    // Cerrar al hacer clic fuera del contenido
    checkoutModal.addEventListener('click', (e) => {
        if(e.target === checkoutModal) {
            closeModal();
        }
    });
    
    // Manejar selección de ofertas
    offerCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remover activo de todos
            offerCards.forEach(c => c.classList.remove('active'));
            radios.forEach(r => r.checked = false);
            
            // Activar el seleccionado
            card.classList.add('active');
            const radio = card.querySelector('.offer-radio');
            radio.checked = true;
            
            // Extraer datos
            const qty = radio.dataset.qty;
            const price = radio.dataset.price;
            const savingsPercent = radio.dataset.savingsPercent || radio.dataset['savings-percent'];
            
            // Actualizar inputs ocultos y el selector en el formulario
            inputQty.value = qty;
            inputTotal.value = price;
            if (clientQtySelect) {
                clientQtySelect.value = qty;
            }
            
            // Actualizar resumen y mostrar el formulario
            summaryQty.textContent = qty;
            summaryTotal.textContent = `RD$${parseInt(price).toLocaleString('en-US')}`;
            const summarySavings = document.getElementById('summary-savings');
            if (summarySavings && savingsPercent) {
                summarySavings.textContent = `${savingsPercent}%`;
            }
            // Mostrar el formulario ahora que una oferta está elegida
            const checkoutBox = document.querySelector('.checkout-box');
            if (checkoutBox) {
                checkoutBox.classList.remove('hidden');
                // Scroll to and focus on name input
                setTimeout(() => {
                    const nameInput = document.getElementById('client-name');
                    nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    nameInput.focus();
                }, 200);
            }
        });
    });

    // Mapa de precios por cantidad y sincronización del selector
    const priceMap = {
        1: { price: 1675, savings: '24%' },
        2: { price: 2390, savings: '46%' }
    };
    
    if (clientQtySelect) {
        clientQtySelect.addEventListener('change', () => {
            const qty = parseInt(clientQtySelect.value);
            const info = priceMap[qty];
            if (info) {
                inputQty.value = qty;
                inputTotal.value = info.price;
                summaryQty.textContent = qty;
                summaryTotal.textContent = `RD$${info.price.toLocaleString('en-US')}`;
                const summarySavings = document.getElementById('summary-savings');
                if (summarySavings) {
                    summarySavings.textContent = info.savings;
                }
                
                // Sincronizar con tarjetas de oferta
                offerCards.forEach(card => {
                    const radio = card.querySelector('.offer-radio');
                    if (radio) {
                        const cardQty = parseInt(radio.dataset.qty);
                        if (cardQty === qty) {
                            card.classList.add('active');
                            radio.checked = true;
                        } else {
                            card.classList.remove('active');
                            radio.checked = false;
                        }
                    }
                });
            }
        });
    }

    // Manejar envío del formulario
    let isSubmitting = false;
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        // Obtener datos
        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const address = document.getElementById('client-address').value.trim();
        const qty = inputQty.value;
        const total = inputTotal.value;
        
        if(!name || !phone || !address) {
            alert('Por favor completa todos los campos.');
            return;
        }
        
        isSubmitting = true;
        
        // Construir mensaje de WhatsApp
        let message = `¡𝗛𝗼𝗹𝗮! 𝗤𝘂𝗶𝗲𝗿𝗼 𝗵𝗮𝗰𝗲𝗿 𝘂𝗻 𝗽𝗲𝗱𝗶𝗱𝗼 𝗰𝗼𝗻𝘁𝗿𝗮 𝗲𝗻𝘁𝗿𝗲𝗴𝗮 🛍️\n\n`;
        message += `𝗣𝗿𝗼𝗱𝘂𝗰𝘁𝗼: Base antiedad\n`;
        message += `𝗖𝗮𝗻𝘁𝗶𝗱𝗮𝗱: ${qty} Unidad(es)\n`;
        message += `𝗧𝗼𝘁𝗮𝗹 𝗮 𝗣𝗮𝗴𝗮𝗿: RD$${parseInt(total).toLocaleString('en-US')}\n\n`;
        
        message += `𝗠𝗶𝘀 𝗗𝗮𝘁𝗼𝘀 𝗽𝗮𝗿𝗮 𝗹𝗮 𝗘𝗻𝘁𝗿𝗲𝗴𝗮:\n`;
        message += `👤 𝗡𝗼𝗺𝗯𝗿𝗲: ${name}\n`;
        message += `📞 𝗧𝗲𝗹𝗲́𝗳𝗼𝗻𝗼: ${phone}\n`;
        message += `📍 𝗗𝗶𝗿𝗲𝗰𝗰𝗶𝗼́𝗻: ${address}\n\n`;
        
        message += `Quedo atento(a) para confirmar mi envío. ¡Gracias!`;
        
        // Codificar URI
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;
        
        // Disparar evento Lead de Meta Pixel (Usuario completó el formulario con éxito)
        if (typeof fbq === 'function') {
            fbq('track', 'Lead', {
                value: parseInt(total),
                currency: 'DOP'
            });
            
            // Disparar evento Purchase
            fbq('track', 'Purchase', {
                value: parseInt(total),
                currency: 'DOP',
                content_type: 'product'
            });
        }
        
        // Redirigir
        window.open(whatsappUrl, '_blank');
        
        // Opcional: Cerrar modal después de enviar
        closeModal();
        
        // Permitir nuevo envío después de 3 segundos para evitar duplicados accidentales
        setTimeout(() => { isSubmitting = false; }, 3000);
    });

    // WhatsApp Flotante Directo
    const waFloatBtn = document.getElementById('wa-float-btn');
    if (waFloatBtn) {
        waFloatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let waMessage = `¡𝗛𝗼𝗹𝗮! 𝗤𝘂𝗶𝗲𝗿𝗼 𝗵𝗮𝗰𝗲𝗿 𝘂𝗻 𝗽𝗲𝗱𝗶𝗱𝗼 𝗰𝗼𝗻𝘁𝗿𝗮 𝗲𝗻𝘁𝗿𝗲𝗴𝗮 🛍️\n\n`;
            waMessage += `𝗣𝗿𝗼𝗱𝘂𝗰𝘁𝗼: Base antiedad\n`;
            waMessage += `𝗖𝗮𝗻𝘁𝗶𝗱𝗮𝗱 (𝗘𝘀𝗰𝗿𝗶𝗯𝗲 𝟭 𝗼 𝟮 𝘂𝗻𝗶𝗱𝗮𝗱𝗲𝘀):\n`;
            waMessage += `👉 1 Unidad por RD$1,675\n`;
            waMessage += `👉 2 Unidades por RD$2,390 (Envío Gratis)\n\n`;
            waMessage += `𝗠𝗶𝘀 𝗗𝗮𝘁𝗼𝘀 𝗽𝗮𝗿𝗮 𝗹𝗮 𝗘𝗻𝘁𝗿𝗲𝗴𝗮:\n`;
            waMessage += `👤 𝗡𝗼𝗺𝗯𝗿𝗲: \n`;
            waMessage += `📞 𝗧𝗲𝗹𝗲́𝗳𝗼𝗻𝗼: \n`;
            waMessage += `📍 𝗗𝗶𝗿𝗲𝗰𝗰𝗶𝗼́𝗻: \n\n`;
            waMessage += `Quedo atento(a) para confirmar mi envío. ¡Gracias!`;
            
            const encodedWaMessage = encodeURIComponent(waMessage);
            const floatWhatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedWaMessage}`;
            window.open(floatWhatsappUrl, '_blank');
        });
    }
});
