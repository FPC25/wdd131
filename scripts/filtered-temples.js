// creating DOM elements
const currentYear = document.querySelector("#currentYear");
const lastModified = document.querySelector("#lastModified");

// creating a new date object
const today = new Date();

// getting the current year
currentYear.textContent = today.getFullYear();

// getting the last modified date
lastModified.textContent = `Last Modification: ${document.lastModified}`;

const hamburger = document.getElementById("hamburger");
const nav = document.querySelector("nav");

hamburger.addEventListener("click", () => {
  nav.classList.toggle("open");
  hamburger.textContent = nav.classList.contains("open") ? "✕" : "☰";
});

// Filtered Temples
const temples = [
  {
    templeName: "Aba Nigeria",
    location: "Aba, Nigeria",
    dedicated: "2005, August, 7",
    area: 11500,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/aba-nigeria/400x250/aba-nigeria-temple-lds-273999-wallpaper.jpg",
  },
  {
    templeName: "Manti Utah",
    location: "Manti, Utah, USA",
    dedicated: "1888, May, 21",
    area: 74792,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/manti-utah/400x250/manti-temple-768192-wallpaper.jpg",
  },
  {
    templeName: "Payson Utah",
    location: "Payson, Utah, USA",
    dedicated: "2015, June, 7",
    area: 96630,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/payson-utah/400x225/payson-utah-temple-exterior-1416671-wallpaper.jpg",
  },
  {
    templeName: "Yigo Guam",
    location: "Yigo, Guam",
    dedicated: "2020, May, 2",
    area: 6861,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/yigo-guam/400x250/yigo_guam_temple_2.jpg",
  },
  {
    templeName: "Washington D.C.",
    location: "Kensington, Maryland, USA",
    dedicated: "1974, November, 19",
    area: 156558,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/washington-dc/400x250/washington_dc_temple-exterior-2.jpeg",
  },
  {
    templeName: "Lima Perú",
    location: "Lima, Perú",
    dedicated: "1986, January, 10",
    area: 9600,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/lima-peru/400x250/lima-peru-temple-evening-1075606-wallpaper.jpg",
  },
  {
    templeName: "Mexico City Mexico",
    location: "Mexico City, Mexico",
    dedicated: "1983, December, 2",
    area: 116642,
    imageUrl:
      "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/mexico-city-mexico/400x250/mexico-city-temple-exterior-1518361-wallpaper.jpg",
  },
  {
    templeName: "St. George Temple",
    location: "St. George, Utah, USA",
    dedicated: "1877, April, 6",
    area: 18633,
    imageUrl:
      "https://www.churchofjesuschrist.org/imgs/5513d22a19c811eebaf2eeeeac1e7e438422c51d/full/800%2C/0/default",
  },
  {
    templeName: "Salt Lake Temple",
    location: "Salt Lake City, Utah, USA",
    dedicated: "1893, April, 6",
    area: 253000,
    imageUrl:
      "https://www.churchofjesuschrist.org/imgs/92c33bcbf9cf85483e008d6871f8ced5f6d7b661/full/800%2C/0/default",
  },
  {
    templeName: "Laie Hawaii Temple",
    location: "Laie, Hawaii, USA",
    dedicated: "1919, November, 27",
    area: 72000,
    imageUrl:
      "https://www.churchofjesuschrist.org/imgs/809f567ccf240d2f1c8e457e8c81fbd94ef96759/full/800%2C/0/default",
  },
];

function templeTemplate(temple) {
  return `<figure class="temple">
            <h3>${temple.templeName}</h3>
            <p><strong>Location</strong>: ${temple.location}</p>
            <p><strong>Dedicated</strong>: ${temple.dedicated}</p>
            <p><strong>Area</strong>: ${temple.area} sq ft</p>
            <img src="${temple.imageUrl}" alt="${temple.templeName} loading="lazy" width="400" height="225">
          </figure>`;
}

function renderTemples(temples) {
  const html = temples.map(templeTemplate);
  document.querySelector("#temples").innerHTML = html.join("");
}

function filterTemplesByArea(temples, Area, comparison = "large") {
  return temples.filter((temple) => {
    switch (comparison) {
      case "large":
        return temple.area >= Area;
      case "small":
        return temple.area <= Area;
      default:
        return false;
    }
  });
}

function filterTemplesByYear(temples, year, comparison = "old") {
  return temples.filter((temple) => {
    const templeYear = parseInt(temple.dedicated.split(",")[0]);
    switch (comparison) {
      case "old":
        return templeYear <= year;
      case "new":
        return templeYear >= year;
      default:
        return false;
    }
  });
}

renderTemples(temples);

document.querySelector("#home").addEventListener("click", () => {
  renderTemples(temples);
});

document.querySelector("#old").addEventListener("click", () => {
  let year = 1900;
  const oldTemples = filterTemplesByYear(temples, year, "old");
  document.querySelector("h2").innerHTML = `<h2>Temples built before ${year}</h2>`;
  renderTemples(oldTemples);
});

document.querySelector("#new").addEventListener("click", () => {
  const year = 2000;  
  const newTemples = filterTemplesByYear(temples, year, "new");
  document.querySelector("h2").innerHTML = `<h2>Temples built after ${year}</h2>`;
  renderTemples(newTemples);
});

document.querySelector("#large").addEventListener("click", () => {
  const area = 90000;  
  const largeTemples = filterTemplesByArea(temples, area, "large");
  document.querySelector("h2").innerHTML = `<h2>Temples with area larger than ${area} sq ft</h2>`;
  renderTemples(largeTemples);
});

document.querySelector("#small").addEventListener("click", () => {
  const area = 10000;  
  const smallTemples = filterTemplesByArea(temples, area, "small");
  document.querySelector("h2").innerHTML = `<h2>Temples with area smaller than ${area} sq ft</h2>`;
  renderTemples(smallTemples);
});
