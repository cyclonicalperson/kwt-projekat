// Funkcije za login/logout
function login(username, password) {
    if (username === 'user' && password === 'pass') { // Hardcoded za demo
        localStorage.setItem('authToken', 'loggedIn');
        alert('Uspešno ulogovani!');
        window.location.href = 'index.html';
    } else {
        alert('Pogrešni kredencijali!');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    alert('Uspešno izlogovani!');
    window.location.href = 'login.html';
}

function isLoggedIn() {
    return localStorage.getItem('authToken') === 'loggedIn';
}

// AJAX za učitavanje događaja iz JSON
function loadEvents(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'events.json', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            const events = JSON.parse(xhr.responseText);
            callback(events);
        } else {
            alert('Greška pri učitavanju događaja!');
        }
    };
    xhr.send();
}

// Prikaz liste događaja na početnoj
function displayEvents(events) {
    const eventList = document.getElementById('event-list');
    if (eventList) {
        eventList.innerHTML = '';
        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
        <h3>${event.name}</h3>
        <p>Datum: ${event.date}</p>
        <p>Lokacija: ${event.location}</p>
        <p>Cena: ${event.price} RSD</p>
        <p>Dostupno ulaznica: ${event.availableTickets}</p>
        <a href="event-details.html?id=${event.id}">Detalji</a>
      `;
            eventList.appendChild(card);
        });
    }
}

// Dohvati event ID iz URL-a (za detalje)
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
        detailsDiv.innerHTML = `
      <h2>${event.name}</h2>
      <p>Datum: ${event.date}</p>
      <p>Lokacija: ${event.location}</p>
      <p>Cena: ${event.price} RSD</p>
      <p>Dostupno ulaznica: ${event.availableTickets}</p>
      <a href="reservation.html?id=${event.id}">Rezerviši</a>
    `;
    } else {
        detailsDiv.innerHTML = '<p>Događaj nije pronađen!</p>';
    }
}

// Rezervacija
function makeReservation(eventId, tickets) {
    if (!isLoggedIn()) {
        alert('Morate biti ulogovani da rezervišete!');
        window.location.href = 'login.html';
        return;
    }
    if (tickets <= 0) {
        alert('Broj ulaznica mora biti veći od 0!');
        return;
    }

    // Simuliraj ažuriranje dostupnih ulaznica (u realnom bi bio server, ovde samo local)
    loadEvents(events => {
        const event = events.find(e => e.id === eventId);
        if (event && event.availableTickets >= tickets) {
            // Sačuvaj rezervaciju u localStorage
            let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            reservations.push({ eventId, eventName: event.name, tickets });
            localStorage.setItem('reservations', JSON.stringify(reservations));
            alert(`Uspešno rezervisano ${tickets} ulaznica za ${event.name}!`);
            window.location.href = 'profile.html';
        } else {
            alert('Nedovoljno dostupnih ulaznica!');
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
            reservations.forEach(res => {
                const item = document.createElement('div');
                item.innerHTML = `<p>${res.eventName} - ${res.tickets} ulaznica</p>`;
                resList.appendChild(item);
            });
        }
    }
}

// Inicijalizacija po strani
document.addEventListener('DOMContentLoaded', () => {
    // Dodaj logout dugme ako je ulogovan
    const nav = document.querySelector('nav ul');
    if (nav && isLoggedIn()) {
        const logoutLi = document.createElement('li');
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.onclick = logout;
        logoutLi.appendChild(logoutBtn);
        nav.appendChild(logoutLi);
    }

    // Po strani
    if (document.getElementById('event-list')) { // index.html
        loadEvents(displayEvents);
    } else if (document.getElementById('event-details')) { // event-details.html
        loadEvents(displayEventDetails);
    } else if (document.getElementById('reservation-form')) { // reservation.html
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
    } else if (document.getElementById('reservation-list')) { // profile.html
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
        }
        displayReservations();
    } else if (document.getElementById('login-form')) { // login.html
        const form = document.getElementById('login-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        };
    }
});