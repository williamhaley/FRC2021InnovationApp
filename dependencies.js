const version = 'v1.0.15';

console.log(`dependencies:version ${version}`);

(() => {
  function registerServiceWorker() {
    console.log('dependencies:registerServiceWorker');
    // Register the service worker if available.
    navigator.serviceWorker.register('./service-worker.js', { scope: '/' }).then(function(registration) {
      if (registration.installing) {
        console.log('dependencies:registration installing');
      } else if (registration.waiting) {
        console.log('dependencies:registration waiting');
      } else if (registration.active) {
        console.log('dependencies:registration active');
      }
    }).catch(function(error) {
      console.log(`Registration failed with ${error}`);
    });
  }

  function updateServiceWorker(registration) {
    console.log('dependencies:updateServiceWorker', registration);
    registration.update();
  }

  window.addEventListener('appinstalled', (event) => {
    console.log('👍', 'appinstalled', event);
  });

  if ('serviceWorker' in navigator) {
    registerServiceWorker();
    // navigator.serviceWorker.getRegistrations().then(registrations => {
    //   if (registrations.length === 0) {
    //     registerServiceWorker();
    //   } else {
    //     updateServiceWorker(registrations[0]);
    //   }
    // }).catch(err => {
    //   console.log('error getting current registrations', err);
    // });
  } else {
    console.log('dependencies:serviceWorker not available');
  }

  // Fires before 'load' and can be used to inform aspects of state.
  window.addEventListener('DOMContentLoaded', () => {
    let displayMode = 'unknown (probably web)';
    if (navigator.standalone) {
      displayMode = 'standalone';
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      displayMode = 'standalone-media';
    }
    console.log(`dependencies:displayMode ${displayMode}`);

    window.addEventListener('online', () => {
      console.log('dependencies:online status changed to online');
    }, false);

    window.addEventListener('offline', () => {
      console.log('dependencies:offline status changed to offline');
    }, false);

    // Different browsers treat this differently.
    const isOnline = navigator.onLine;
    console.log(`dependencies:isOnline ${isOnline}`);

    if (isOnline && /.*map.*/.test(window.location.pathname)) {
      const s = document.createElement('script');
      const src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCe9Kd-PQQX4pQrhmP76Imolo7Kvn2Ev3I&callback=initMap&libraries=&v=weekly`;
      s.setAttribute('src', src);
      document.body.appendChild(s);
    }
    // setInterval(() => {
    //   navigator.geolocation.getCurrentPosition((position) => {
    //     console.log(position.coords.latitude, position.coords.longitude);
    //     console.log(position.coords.speed);
    //   });
    // }, 2000);
  });

  window.addEventListener('load', async () => {
    let $version = document.createElement('span');
    $version.textContent = version;
    document.querySelector('footer').appendChild($version);

    const res = await fetch('/manifest.json');
    await res.text();
    console.log('dependencies:load test fetch complete');
  });
})();

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
};

database = {
  saveItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  getItem(key) {
    return JSON.parse(localStorage.getItem(key));
  },
}
