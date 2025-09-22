// Funkcija za prikaz modala
function showModal(message, redirectUrl = null) {
    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal';
        modal.innerHTML = `
      <div class="modal-content">
        <p>${message}</p>
        <button onclick="closeModal()">OK</button>
      </div>
    `;
        document.body.appendChild(modal);
    } else {
        modal.querySelector('p').textContent = message;
        modal.style.display = 'flex';
    }
    if (redirectUrl) {
        modal.querySelector('button').onclick = () => {
            closeModal();
            window.location.href = redirectUrl;
        };
    }
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
            showModal('Greška pri učitavanju događaja!');
        }
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
        <h3>${event.name}</h3>
        <p>Datum: ${event.date}</p>
        <p>Lokacija: ${event.location}</p>
        <p>Cena: ${event.price} RSD</p>
        <p>Dostupno ulaznica: ${event.availableTickets}</p>
        <a href="event-details.html?id=${event.id}">Detalji</a>
      `;
            eventList.appendChild(card);
            setTimeout(() => {
                card.style.opacity = '1';
            }, index * 100);
        });
    }
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
      <h2>${event.name}</h2>
      <p>Datum: ${event.date}</p>
      <p>Lokacija: ${event.location}</p>
      <p>Cena: ${event.price} RSD</p>
      <p>Dostupno ulaznica: ${event.availableTickets}</p>
      <a href="reservation.html?id=${event.id}">Rezerviši</a>
    `;
        setTimeout(() => {
            detailsDiv.style.opacity = '1';
        }, 100);
    } else {
        detailsDiv.innerHTML = '<p>Događaj nije pronađen!</p>';
    }
}

// Rezervacija
function makeReservation(eventId, tickets) {
    if (!isLoggedIn()) {
        showModal('Morate biti ulogovani da rezervišete!', 'login.html');
        return;
    }
    if (tickets <= 0) {
        showModal('Broj ulaznica mora biti veći od 0!');
        return;
    }

    loadEvents(events => {
        const event = events.find(e => e.id === eventId);
        if (event && event.availableTickets >= tickets) {
            let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            reservations.push({ eventId, eventName: event.name, tickets });
            localStorage.setItem('reservations', JSON.stringify(reservations));
            showModal(`Uspešno rezervisano ${tickets} ulaznica za ${event.name}!`, 'profile.html');
        } else {
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
            resList.innerHTML = '<p>Nema rezervacija.</p>';
        } else {
            reservations.forEach((res, index) => {
                const item = document.createElement('div');
                item.className = 'event-card';
                item.style.opacity = '0';
                item.style.transition = 'opacity 0.5s ease';
                item.innerHTML = `<p>${res.eventName} - ${res.tickets} ulaznica</p>`;
                resList.appendChild(item);
                setTimeout(() => {
                    item.style.opacity = '1';
                }, index * 100);
            });
        }
    }
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
        form.onsubmit = (e) => {
            e.preventDefault();
            const eventId = getEventIdFromUrl();
            const tickets = parseInt(document.getElementById('tickets').value);
            makeReservation(eventId, tickets);
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