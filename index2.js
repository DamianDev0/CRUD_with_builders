class Utilities {
  static generateId() {
    return Utilities.increment++;
  }

  static generateToken() {
    return Math.random().toString(36).substring(2);
  }
}

Utilities.increment = 0;

class User {
  constructor(name, email, role) {
    this.name = name;
    this.email = email;
    this.role = role;
  }

  static createUser(name, email, role) {
    const token = Utilities.generateToken();
    const user = new User(name, email, role);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    return user;
  }

  static logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    location.reload();
  }

  static getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}

class RegularUser extends User {
  constructor(name, email, role) {
    super(name, email, role);
  }

  renderRegular() {
    const $container = document.getElementById("container");
    $container.innerHTML = /*html*/ `
        <div class="flex justify-between">

          <h2 class="text-2xl font-semibold mb-4 text-white">Welcome, ${this.name}!</h2>
          <button id="logoutBtn" class="text-white text-xl mr-7
                  hover:text-orange-400" onclick="User.logOut()">Logout</button>
        </div>
        <div id="bookingsList" class="grid grid-cols-3 gap-9 max-w-full max-h-full"></div>
      
    `;

    //se muestra falso para desahablitar los botones de edicion y eliminar
    Bookings.showBookings(false);
  }
}

//se crea una clase admin que se extiende de User
class AdminUser extends User {
  constructor(name, email, role) {
    super(name, email, role);
  }

  renderAdmin() {
    // se crea el metodo que sera renderizado al admin
    const $container = document.getElementById("container");
    $container.innerHTML = "";
    $container.innerHTML += /*html*/ `
        <h2 class="py-4 text-2xl text-white ml-32">Create a Booking</h2>

    <div class="w-full  backdrop-blur p-6 rounded-lg 
                h-full grid grid-cols-2 gap-4 ">

       <div class="max-w-96 h-full text-white shadow-md">
          <form id="bookingForm">

          <label for="departure" class="block text-sm font-semibold
            text-white">Departure:</label>

          <input type="text" id="departure" name="departure" required 
          class="mt-1 block w-full border rounded-md
          border-gray-700/10 bg-black/20 shadow-sm p-1">
          <br><br>

          <label for="destination" class="block text-sm font-semibold
          text-white">Destination:</label>

          <input type="text" id="destination" name="destination" 
          required class="mt-1 block w-full border rounded-md border-gray-700/10
          bg-black/20 shadow-sm p-1">
          <br><br>

          <label for="date" class="block text-sm font-semibold
          text-white">Date:</label>

          <input type="date" id="date" name="date" required class="mt-1 block w-full
          border rounded-md border-gray-700/10 bg-black/20 shadow-sm p-1">

          <br><br>
          <label for="time" class="block text-sm font-semibold
          text-white">Time:</label>

          <input type="time" id="time" name="time" required class="mt-1 block 
          w-full border rounded-md border-gray-700/10 bg-black/20 shadow-sm p-1">

          <br><br>
          <button type="submit" class="w-full bg-gradient-to-r from-rose-400 to-orange-300
          text-white py-2 px-4 rounded-md my-4">Submit</button>
        </form>
  </div>

      <div id="bookingsList" class="grid grid-cols-3 gap-9 max-w-full max-h-full"></div>
            <div class="absolute right-1 z-20 top-0 mr-7">
            <i class='bx bx-log-in text-2xl  text-orange-500' ></i>
            <button class="text-white text-2xl font-extralight
            hover:text-orange-400" onclick="User.logOut()">Logout</button>
      </div>
              `;

    // se capturan por id los elementos del html
    const $bookingForm = document.getElementById("bookingForm");
    const $departure = document.getElementById("departure");
    const $destination = document.getElementById("destination");
    const $date = document.getElementById("date");
    const $time = document.getElementById("time");

    $bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      //tomamos los valores del formulario
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

      //h¿accedemos a la clase Bookins al metodo SaveBookin para guardarla
      //en el localStorage

      Bookings.saveBooking(booking);

      alert(
        `Booking created successfully from ${departure} to ${destination} on ${date} at ${time}!`
      );

      Bookings.showBookings();
    });

    // Mostrar las reservas inicialmente
    Bookings.showBookings();
  }
}

// creamos la clase Bookings que contiene todos los metodos CRUD
class Bookings {
  constructor(departure, destination, date, time) {
    this.departure = departure;
    this.destination = destination;
    this.date = date;
    this.time = time;
  }

  static createBooking(departure, destination, date, time) {
    const id = Utilities.generateId();
    return new Bookings(id, departure, destination, date, time);
  }

  static saveBooking(booking) {
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));
  }

  static deleteBooking(id) {
    const option = confirm("are you sure you want to delete this bookin");
    if (option) {
      let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
      bookings = bookings.filter((booking) => booking.id !== id);
      localStorage.setItem("bookings", JSON.stringify(bookings));
      alert("Booking deleted successfully!");
      window.location.reload();
    }
  }

  static editBooking(id) {
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const booking = bookings.find((booking) => booking.id === id);

    if (!booking) return;

    const $container = document.getElementById("container");
    $container.innerHTML = /*html*/ `
          <h2 class="py-4 text-2xl text-white ml-40">Edit Booking</h2>
          
        <div class="max-w-96  h-full text-white shadow-md ml-11">
            <form id="editBookingForm">
                  <label  class="block text-sm font-semibold
                    text-white" for="editDeparture">Departure:</label>

                  <input class="mt-1 block w-full
                   border rounded-md border-gray-700/10 bg-black/20 shadow-sm 
                   p-1" type="text" id="editDeparture" name="editDeparture"
                   value="${booking.departure}" required>

                  <br><br>
                  <label  class="block text-sm font-semibold
                   text-white" for="editDestination">Destination:</label>

                   <input class="mt-1 block w-full
                   border rounded-md border-gray-700/10 bg-black/20 shadow-sm p-1"
                   type="text" id="editDestination" name="editDestination" 
                   value="${booking.destination}" required>

                   <br><br>
                  <label  class="block text-sm font-semibold
                   text-white" for="editDate">Date:</label>
                   <input class="mt-1 block w-full
                     border rounded-md border-gray-700/10 bg-black/20 shadow-sm p-1" 
                     type="date" id="editDate" name="editDate" value="${booking.date}" required>

                   <br><br>
                  <label class="block text-sm font-semibold
                    text-white" for="editTime">Time:</label>

                  <input class="mt-1 block w-full
                     border rounded-md border-gray-700/10 bg-black/20 shadow-sm p-1"
                      type="time" id="editTime" name="editTime" value="${booking.time}" required>

                  <br><br>
                  <button class="w-full bg-gradient-to-r from-rose-400 to-orange-300
                  text-white py-2 px-4 rounded-md my-4" type="submit">Submit</button>
          </form>
    </div>
          
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
      window.location.reload();
    });
  }

  static showBookings(showButtons = true) {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const $bookingsList = document.getElementById("bookingsList");
    $bookingsList.innerHTML = ""; // Clear previous content

    bookings.forEach((booking) => {
      const bookingElement = document.createElement("div");
      bookingElement.innerHTML = /*html*/ `

        <div class="flex flex-col items-start justify-center text-black shadow-2xl
         bg-orange-300 rounded-xl p-2 md:w-full my-8">

          <div>
            <p><strong>Departure:</strong> ${booking.departure}</p>
            <p><strong>Destination:</strong> ${booking.destination}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>

            <div class="flex justify-between mt-4">
              ${
                showButtons
                  ? /*html*/ `
                <button class="p-2 bg-orange-200 font-bold rounded-xl" 
                onclick="Bookings.deleteBooking(${booking.id})">Delete</button>

                <button class="p-2 bg-orange-200 font-bold rounded-xl"
                 onclick="Bookings.editBooking(${booking.id})">Edit</button>
              `
                  : /*html*/ `
                <button  class="p-2 bg-orange-200 font-bold rounded-xl" onclick="Bookings.reserve(${booking.id})">Reserve</button>

              `
              }
            </div>
          </div>
        </div>
      `;
      $bookingsList.appendChild(bookingElement);
    });
  }

  static reserve(id) {
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    const booking = bookings.find((booking) => booking.id === id);

    if (booking) {
      reservas.push(booking);
      localStorage.setItem("reservas", JSON.stringify(reservas));
      alert(
        `Booking from ${booking.departure} to ${booking.destination} reserved!`
      );
    } else {
      alert("Booking not found!");
    }
  }
}

const $container = document.getElementById("container");

function registerForm() {
  $container.innerHTML = /*html*/ `
    <div class="flex items-center justify-center h-screen text-white">

        <div class="flex flex-col items-center justify-center w-full max-w-md
         bg-white/5 backdrop-blur p-6 rounded-lg shadow-md">

            <h2 class="text-3xl font-semibold mb-4 text-white ">Register</h2>
            <br>
            <form id="registerForm" class="w-full">

              <div class="flex items-center"> 
                <i class='bx bx-user relative top-1 mr-2 text-xl'></i> 
                <input type="text" id="username" name="username" class="mt-1 block w-full border bg-black/20
                border-gray-700/10 rounded-md shadow-sm p-2" required placeholder="Username">
             </div>

                <br><br>
                <div class="flex items-center">
                <i class='bx bx-envelope relative top-1 mr-2 text-xl' ></i>
                <input type="email" id="email" name="email" class="mt-1 block w-full border rounded-md
                 border-gray-700/10 bg-black/20 shadow-sm p-2" required placeholder="Email">
                </div>
                
                <br><br>
               
                <div class="flex items-center">
                  <i class='bx bx-group relative top-1 mr-2 text-xl'></i>
                  <select id="role" name="role" class="mt-1 block w-full border border-gray-700/10 bg-black/20 rounded-md shadow-sm p-2" required>
                      <option value="" disabled selected>Select Role</option>
                      <option value="Admin">Admin</option>
                      <option value="Regular">Regular</option>
                  </select>
              </div>
                <br><br>
                <br><br>
                <button type="submit" class="w-96 m-auto ml-5 bg-gradient-to-r from-rose-400
                 to-orange-300 text-white py-2 px-4 rounded-md">Submit</button>
            </form>
        </div>
    </div>
    `;

  const $registerForm = document.getElementById("registerForm");

  $registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const user = User.createUser(name, email, role);
    alert("User registered successfully!");

    if (role === "Admin") {
      const adminUser = new AdminUser(name, email, role);
      adminUser.renderAdmin();
    } else {
      const regularUser = new RegularUser(name, email, role);
      regularUser.renderRegular();
    }
  });
}

function checkUserStatus() {
  const user = User.getCurrentUser();
  if (user) {
    if (user.role === "Admin") {
      const adminUser = new AdminUser(user.name, user.email, user.role);
      adminUser.renderAdmin();
    } else {
      const regularUser = new RegularUser(user.name, user.email, user.role);
      regularUser.renderRegular();
    }
  } else {
    registerForm();
  }
}

checkUserStatus();
