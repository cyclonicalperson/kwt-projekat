// Funkcija za prikaz modala
function showModal(message, redirectUrl = null) {
    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <button onclick="handleModalClose('${redirectUrl}')">OK</button>
        </div>
    `;
    modal.style.display = 'flex';
}

function handleModalClose(redirectUrl) {
    closeModal();
    if (redirectUrl && redirectUrl !== 'null') {
        window.location.href = redirectUrl;
    }
}

// Funkcija za prikaz custom modala bez OK dugmeta
function showCustomModal(htmlContent) {
    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div class="modal-content">
            ${htmlContent}
        </div>
    `;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
}

// Funkcije za login/logout
function login(username, password) {
    if (username === 'user' && password === 'pass') {
        localStorage.setItem('authToken', 'loggedIn');
        showModal('Uspešno ulogovani!', 'index.html');
    } else {
        showModal('Pogrešni kredencijali!');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    showModal('Uspešno izlogovani!', 'login.html');
}

function isLoggedIn() {
    return localStorage.getItem('authToken') === 'loggedIn';
}

// AJAX za učitavanje događaja
function loadEvents(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'events.json', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            const events = JSON.parse(xhr.responseText);
            callback(events);
        } else {
            // Fallback na mock podatke ako events.json nije dostupan
            console.warn('events.json nije dostupan, koriste se mock podaci');
            callback(eventsData);
        }
    };
    xhr.onerror = function() {
        // Fallback na mock podatke u slučaju greške
        console.warn('AJAX greška, koriste se mock podaci');
        callback(eventsData);
    };
    xhr.send();
}

// Prikaz liste događaja sa fade-in efektom
function displayEvents(events) {
    const eventList = document.getElementById('event-list');
    if (eventList) {
        eventList.innerHTML = '';
        events.forEach((event, index) => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.style.opacity = '0';
            card.style.transition = 'opacity 0.5s ease';
            card.innerHTML = `
                <div class="event-image">
                    <img src="${event.image}" alt="${event.name}" loading="lazy">
                    <div class="event-category">${event.category}</div>
                </div>
                <div class="event-content">
                    <h3>${event.name}</h3>
                    <p class="event-description">${event.description}</p>
                    <div class="event-details">
                        <p><i class="icon-calendar"></i> ${formatDate(event.date)}</p>
                        <p><i class="icon-location"></i> ${event.location}</p>
                        <p class="price"><i class="icon-money"></i> ${event.price} RSD</p>
                        <p class="tickets"><i class="icon-ticket"></i> ${event.availableTickets} dostupno</p>
                    </div>
                    <a href="event-details.html?id=${event.id}" class="btn-primary">Detalji</a>
                </div>
            `;
            eventList.appendChild(card);
            setTimeout(() => {
                card.style.opacity = '1';
            }, index * 100);
        });
    }
}

// Funkcija za formatiranje datuma
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    return date.toLocaleDateString('sr-RS', options);
}

// Dohvati event ID iz URL-a
function getEventIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'));
}

// Prikaz detalja događaja
function displayEventDetails(events) {
    const eventId = getEventIdFromUrl();
    const event = events.find(e => e.id === eventId);
    const detailsDiv = document.getElementById('event-details');
    if (detailsDiv && event) {
        detailsDiv.style.opacity = '0';
        detailsDiv.style.transition = 'opacity 0.5s ease';
        detailsDiv.innerHTML = `
            <div class="event-detail-card">
                <div class="event-detail-image">
                    <img src="${event.image}" alt="${event.name}">
                    <div class="event-category">${event.category}</div>
                </div>
                <div class="event-detail-content">
                    <h2>${event.name}</h2>
                    <p class="event-description">${event.description}</p>
                    <div class="event-detail-info">
                        <p><i class="icon-calendar"></i> ${formatDate(event.date)}</p>
                        <p><i class="icon-location"></i> ${event.location}</p>
                        <p class="price"><i class="icon-money"></i> ${event.price} RSD</p>
                        <p class="tickets"><i class="icon-ticket"></i> ${event.availableTickets} dostupno</p>
                    </div>
                    <a href="reservation.html?id=${event.id}" class="btn-primary btn-large">Rezerviši</a>
                </div>
            </div>
        `;
        setTimeout(() => {
            detailsDiv.style.opacity = '1';
        }, 100);
    } else {
        detailsDiv.innerHTML = '<p>Događaj nije pronađen!</p>';
    }
}

// Rezervacija
let isReserving = false; // Globalni flag za rezervaciju

function makeReservation(eventId, tickets) {
    if (isReserving) return; // Spreči duplu rezervaciju

    if (!isLoggedIn()) {
        showModal('Morate biti ulogovani da rezervišete!', 'login.html');
        return;
    }
    if (tickets <= 0) {
        showModal('Broj ulaznica mora biti veći od 0!');
        return;
    }

    isReserving = true; // Postavi flag

    loadEvents(events => {
        const event = events.find(e => e.id === eventId);
        if (event && event.availableTickets >= tickets) {
            let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            const newReservation = {
                eventId,
                eventName: event.name,
                tickets,
                reservationDate: new Date().toISOString().split('T')[0],
                timestamp: Date.now()
            };
            reservations.push(newReservation);
            localStorage.setItem('reservations', JSON.stringify(reservations));

            isReserving = false; // Resetuj flag
            showModal(`Uspešno rezervisano ${tickets} ulaznica za ${event.name}!`, 'profile.html');
        } else {
            isReserving = false; // Resetuj flag
            showModal('Nedovoljno dostupnih ulaznica!');
        }
    });
}

// Prikaz mojih rezervacija
function displayReservations() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const resList = document.getElementById('reservation-list');
    if (resList) {
        resList.innerHTML = '';
        if (reservations.length === 0) {
            resList.innerHTML = `
                <div class="empty-reservations">
                    <div class="empty-icon">🎫</div>
                    <h3>Nema rezervacija</h3>
                    <p>Još uvek nemate rezervisanih događaja.</p>
                    <a href="index.html" class="btn-primary">Pogledaj događaje</a>
                </div>
            `;
        } else {
            loadEvents(events => {
                reservations.forEach((res, index) => {
                    const event = events.find(e => e.id === res.eventId);
                    if (event) {
                        const item = document.createElement('div');
                        item.className = 'reservation-card';
                        item.style.opacity = '0';
                        item.style.transition = 'opacity 0.5s ease';

                        const totalPrice = event.price * res.tickets;
                        const reservationDate = res.reservationDate || new Date().toISOString().split('T')[0];

                        item.innerHTML = `
                            <div class="reservation-image">
                                <img src="${event.image}" alt="${event.name}" loading="lazy">
                                <div class="reservation-status">Rezervisano</div>
                            </div>
                            <div class="reservation-content">
                                <div class="reservation-header">
                                    <h3>${event.name}</h3>
                                    <span class="reservation-id">#${res.eventId}${index.toString().padStart(3, '0')}</span>
                                </div>
                                <p class="reservation-description">${event.description}</p>
                                <div class="reservation-details">
                                    <div class="detail-row">
                                        <span class="detail-label"><i class="icon-calendar"></i> Datum događaja:</span>
                                        <span class="detail-value">${formatDate(event.date)}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label"><i class="icon-location"></i> Lokacija:</span>
                                        <span class="detail-value">${event.location}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label"><i class="icon-ticket"></i> Broj ulaznica:</span>
                                        <span class="detail-value highlight">${res.tickets}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label"><i class="icon-money"></i> Ukupna cena:</span>
                                        <span class="detail-value price">${totalPrice} RSD</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">🗓️ Rezervisano:</span>
                                        <span class="detail-value">${formatDate(reservationDate)}</span>
                                    </div>
                                </div>
                                <div class="reservation-actions">
                                    <button class="btn-danger" onclick="cancelReservation(${index})">
                                        ❌ Otkaži rezervaciju
                                    </button>
                                </div>
                            </div>
                        `;
                        resList.appendChild(item);
                        setTimeout(() => {
                            item.style.opacity = '1';
                        }, index * 100);
                    }
                });
            });
        }
    }
}

// Otkazivanje rezervacije
function cancelReservation(reservationIndex) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const reservation = reservations[reservationIndex];

    if (!reservation) return;

    // Potvrdi otkazivanje
    const confirmHTML = `
        <div class="cancel-confirmation">
            <div class="warning-icon">⚠️</div>
            <h3>Potvrdi otkazivanje</h3>
            <p>Da li ste sigurni da želite da otkažete rezervaciju za <strong>${reservation.eventName}</strong>?</p>
            <p class="warning-text">Ova akcija se ne može poništiti.</p>
            <div class="confirmation-actions">
                <button class="btn-secondary" onclick="closeModal()">Odustani</button>
                <button class="btn-danger" onclick="confirmCancelReservation(${reservationIndex})">Da, otkaži</button>
            </div>
        </div>
    `;

    showCustomModal(confirmHTML);
}

// Potvrdi otkazivanje rezervacije
function confirmCancelReservation(reservationIndex) {
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const canceledReservation = reservations[reservationIndex];

    // Ukloni rezervaciju
    reservations.splice(reservationIndex, 1);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    // Prikaži poruku o uspešnom otkazivanju
    const successHTML = `
        <div class="cancellation-success">
            <div class="success-icon">✅</div>
            <h3>Rezervacija je otkazana</h3>
            <p>Uspešno ste otkazali rezervaciju za <strong>${canceledReservation.eventName}</strong>.</p>
        </div>
    `;

    showCustomModal(successHTML);

    // Automatski zatvori modal i osvezi stranicu nakon 2 sekunde
    setTimeout(() => {
        closeModal();
        window.location.reload();
    }, 2000);
}

// Dinamičko upravljanje navigacijom
function updateNavigation() {
    const nav = document.querySelector('nav ul');
    if (nav) {
        // Ukloni postojeće login/logout stavke (i staro dugme iz HTML-a)
        const existingAuth = document.querySelector('#auth-nav');
        if (existingAuth) {
            existingAuth.remove();
        }

        // Ukloni i poslednji li element koji sadrži login link iz HTML-a
        const lastNavItem = nav.querySelector('li:last-child');
        if (lastNavItem && (lastNavItem.textContent.includes('Login') || lastNavItem.textContent.includes('Logout'))) {
            lastNavItem.remove();
        }

        // Dodaj odgovarajuću stavku na osnovu stanja logina
        const authLi = document.createElement('li');
        authLi.id = 'auth-nav';
        if (isLoggedIn()) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logout-btn';
            logoutBtn.textContent = 'Logout';
            logoutBtn.onclick = logout;
            authLi.appendChild(logoutBtn);
        } else {
            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.textContent = 'Login';
            authLi.appendChild(loginLink);
        }
        nav.appendChild(authLi);
    }
}

// Inicijalizacija po strani
document.addEventListener('DOMContentLoaded', () => {
    // Ažuriraj navigaciju na početku
    updateNavigation();

    // Po strani
    if (document.getElementById('event-list')) {
        loadEvents(displayEvents);
    } else if (document.getElementById('event-details')) {
        loadEvents(displayEventDetails);
    } else if (document.getElementById('reservation-form')) {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
        }
        const form = document.getElementById('reservation-form');
        let formSubmitted = false; // Lokalni flag za formu

        form.onsubmit = (e) => {
            e.preventDefault();

            if (formSubmitted) return false; // Spreči dupli submit
            formSubmitted = true;

            const eventId = getEventIdFromUrl();
            const tickets = parseInt(document.getElementById('tickets').value);
            makeReservation(eventId, tickets);

            // Resetuj flag nakon 3 sekunde
            setTimeout(() => {
                formSubmitted = false;
            }, 3000);

            return false;
        };
    } else if (document.getElementById('reservation-list')) {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
        }
        displayReservations();
    } else if (document.getElementById('login-form')) {
        const form = document.getElementById('login-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        };
    }
});