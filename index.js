class Utilities {
  constructor() {
    this.increment = 0;
  }

  static checkToken() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "index.html";
    }
  }

  generateId() {
    return this.increment++;
  }

  renderLogin() {
    const $container = document.getElementById("container");
    $container.innerHTML = /*html*/ `
    <div class="flex items-center justify-center h-screen
     text-white">

    <div class="flex flex-col items-center justify-center
     w-full max-w-md bg-white/5
     backdrop-blur p-6 rounded-lg shadow-md">

     <h2 class="text-3xl font-semibold mb-4 text-white">Register</h2>
      <form id="registerForm" class="w-full">

        <label for="username" class="block text-sm font-semibold
         text-white">Username</label>

        <input type="text" id="username" name="username" class="mt-1 block w-full border bg-black/20
         border-gray-700/10 rounded-md shadow-sm p-2" required>

        <br><br>

        <label for="email" class="block text-sm font-semibold
         text-white">Email:</label>
        <input type="email" id="email" name="email" class="mt-1 block w-full 
        border rounded-md  border-gray-700/10  bg-black/20 shadow-sm p-2" required>
        <br><br>
        <label for="role" class="text-sm font-semibold
         text-white">Role</label>

        <select id="role" name="role" class="mt-1 block w-full border
          border-gray-700/10  bg-black/20 rounded-md shadow-sm p-2" required>

          <option value="" disabled selected class="">Select Role</option>
          <option value="Admin">Admin</option>
          <option value="Regular">Regular</option>

        </select>
        <br><br>
        <button type="submit" class="w-full bg-gradient-to-r from-rose-400
         to-orange-300 text-white py-2 
        px-4 rounded-md">Submit</button>
      </form>
    </div>
  </div>
`;

    const $registerForm = document.getElementById("registerForm");
    const $username = document.getElementById("username");
    const $email = document.getElementById("email");
    const $role = document.getElementById("role");

    $registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = $username.value;
      const email = $email.value;
      const roleValue = $role.value === "Regular" ? "Regular" : "Admin";

      let user;
      if (roleValue === "Regular") {
        user = User.createRegularUser(username, email);
      } else {
        user = User.createAdmin(username, email);
      }

      User.saveUser(user);
      new Auth(user);

      // Mostrar alerta de éxito
      alert(`User ${username} created successfully with role ${roleValue} !`);

      // Guardar rol en localStorage
      localStorage.setItem("role", roleValue);

      // Renderizar según el rol
      if (roleValue === "Admin") {
        this.renderReservaAdmin();
      } else {
        this.renderReservaRegular();
      }
    });
  }

  renderReservaAdmin() {
    const $container = document.getElementById("container");
    $container.innerHTML = "";
    $container.innerHTML = /*html*/ `
      <div>
        <h2 >Create a Booking</h2>
        <form id="bookingForm">
          <label for="departure">Departure:</label>
          <input type="text" id="departure" name="departure" required>
          <br><br>
          <label for="destination">Destination:</label>
          <input type="text" id="destination" name="destination" required>
          <br><br>
          <label for="date">Date:</label>
          <input type="date" id="date" name="date" required>
          <br><br>
          <label for="time">Time:</label>
          <input type="time" id="time" name="time" required>
          <br><br>
          <button type="submit">Submit</button>
        </form>
        <div id="bookingsList"></div>
    </div>
      `;

    const $bookingForm = document.getElementById("bookingForm");
    const $departure = document.getElementById("departure");
    const $destination = document.getElementById("destination");
    const $date = document.getElementById("date");
    const $time = document.getElementById("time");

    $bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const departure = $departure.value;
      const destination = $destination.value;
      const date = $date.value;
      const time = $time.value;

      const booking = Bookings.createBooking(
        departure,
        destination,
        date,
        time
      );
      Bookings.saveBooking(booking);

      // Mostrar alerta de éxito
      alert(
        `Booking created successfully from ${departure} to ${destination} on ${date} at ${time}!`
      );

      // Limpiar el formulario
      $bookingForm.reset();

      // Mostrar las reservas
      Bookings.showBookings();
    });

    // Mostrar las reservas inicialmente
    Bookings.showBookings();
  }

  renderReservaRegular() {
    const $container = document.getElementById("container");
    $container.innerHTML = "";
    alert("Regular");
  }
}

// Inicializar la clase Utilities y renderizar la página
const utilities = new Utilities();
utilities.renderLogin();

class Auth {
  constructor(user) {
    const token = Auth.generateToken();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  }

  static generateToken() {
    return Math.random().toString(36).substr(2);
  }

  static logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

class User {
  constructor(id, name, email, role) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
  }

  static createRegularUser(name, email) {
    const id = utilities.generateId();
    return new User(id, name, email, "Regular");
  }

  static createAdmin(name, email) {
    const id = utilities.generateId();
    return new User(id, name, email, "Admin");
  }

  getInfo() {
    return `ID: ${this.id}, Name: ${this.name}, Email: ${this.email}, Role: ${this.role}`;
  }

  static saveUser(user) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
  }

  static getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
  }

  static updateUser(email, newUserData) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((user) => user.email === email);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...newUserData };
      localStorage.setItem("users", JSON.stringify(users));
      return true;
    }
    return false;
  }

  static deleteUser(email) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.filter((user) => user.email !== email);
    localStorage.setItem("users", JSON.stringify(users));
  }
}

class Bookings {
  constructor(id, departure, destination, date, time) {
    this.id = id;
    this.departure = departure;
    this.destination = destination;
    this.date = date;
    this.time = time;
  }

  static createBooking(departure, destination, date, time) {
    const id = utilities.generateId();
    return new Bookings(id, departure, destination, date, time);
  }

  static saveBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }

  static getBookings() {
    return JSON.parse(localStorage.getItem("bookings")) || [];
  }

  static deleteBooking(id) {
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings = bookings.filter((booking) => booking.id !== id);
    localStorage.setItem("bookings", JSON.stringify(bookings));
    alert("Booking deleted successfully!");
    utilities.renderReservaAdmin();
  }

  static editBooking(id) {
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const booking = bookings.find((booking) => booking.id === id);

    if (!booking) return;

    const $container = document.getElementById("container");
    $container.innerHTML = /*html*/ `
        <h2>Edit Booking</h2>
        <form id="editBookingForm">
          <label for="editDeparture">Departure:</label>
          <input type="text" id="editDeparture" name="editDeparture" value="${booking.departure}" required>
          <br><br>
          <label for="editDestination">Destination:</label>
          <input type="text" id="editDestination" name="editDestination" value="${booking.destination}" required>
          <br><br>
          <label for="editDate">Date:</label>
          <input type="date" id="editDate" name="editDate" value="${booking.date}" required>
          <br><br>
          <label for="editTime">Time:</label>
          <input type="time" id="editTime" name="editTime" value="${booking.time}" required>
          <br><br>
          <button type="submit">Submit</button>
        </form>
      `;

    const $editBookingForm = document.getElementById("editBookingForm");
    $editBookingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      booking.departure = document.getElementById("editDeparture").value;
      booking.destination = document.getElementById("editDestination").value;
      booking.date = document.getElementById("editDate").value;
      booking.time = document.getElementById("editTime").value;

      localStorage.setItem("bookings", JSON.stringify(bookings));
      alert("Booking updated successfully!");
      utilities.renderReservaAdmin();
    });
  }

  static showBookings() {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const $bookingsList = document.getElementById("bookingsList");
    $bookingsList.innerHTML = ""; // Clear previous content

    bookings.forEach((booking) => {
      const bookingElement = document.createElement("div");
      bookingElement.innerHTML = `
          <p><strong>ID:</strong> ${booking.id}</p>
          <p><strong>Departure:</strong> ${booking.departure}</p>
          <p><strong>Destination:</strong> ${booking.destination}</p>
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <button onclick="Bookings.deleteBooking(${booking.id})">Delete</button>
          <button onclick="Bookings.editBooking(${booking.id})">Edit</button>
          <hr>
        `;
      $bookingsList.appendChild(bookingElement);
    });
  }
}
