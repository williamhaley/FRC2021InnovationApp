(() => {
  function registerServiceWorker() {
    console.log('register service worker');
    // Register the service worker if available.
    navigator.serviceWorker.register('./service-worker.js', { scope: '/' }).then(function(registration) {
      console.log('Successfully registered service worker', registration);
    }).catch(function(err) {
      console.warn('Error whilst registering service worker', err);
    });
  }

  function updateServiceWorker(registration) {
    console.log('update service worker', registration);
  }

  window.addEventListener('appinstalled', (event) => {
    console.log('👍', 'appinstalled', event);
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length === 0) {
        registerServiceWorker();
      } else {
        updateServiceWorker(registrations[0]);
      }
    }).catch(err => {
      console.log('error getting current registrations', err);
    });
  } else {
    console.log('serviceServer not available');
  }

  // Fires before 'load' and can be used to inform aspects of state.
  window.addEventListener('DOMContentLoaded', () => {
    let displayMode = 'browser tab';
    if (navigator.standalone) {
      displayMode = 'standalone-ios';
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      displayMode = 'standalone';
      isInstalled = true;
    }
    // Log launch display mode to analytics
    console.log('DISPLAY_MODE_LAUNCH:', displayMode);
  });

  window.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('online', function(e) {
      // Resync data with server.
      console.log("You are now online");
      // Page.hideOfflineWarning();
      // Arrivals.loadData();
    }, false);

    window.addEventListener('offline', function(e) {
      // Queue up events for server.
      console.log("You are now offline");
      // Page.showOfflineWarning();
    }, false);

    // Check if the user is connected. If so and they're on a map page, render it.
    if (navigator.onLine && /.*map.*/.test(window.location.pathname)) {
      console.log('started online');

      const s = document.createElement('script');
      const src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCe9Kd-PQQX4pQrhmP76Imolo7Kvn2Ev3I&callback=initMap&libraries=&v=weekly`;
      s.setAttribute('src', src);
      document.body.appendChild(s);

      // Arrivals.loadData();
    } else {
      console.log('started offline');
      // Show offline message
      // Page.showOfflineWarning();
    }

    // setInterval(() => {
    //   navigator.geolocation.getCurrentPosition((position) => {
    //     console.log(position.coords.latitude, position.coords.longitude);
    //     console.log(position.coords.speed);
    //   });
    // }, 2000);
  });

  window.addEventListener('load', () => {
    console.log(`page loaded: ${window.location.pathname}`);
    if (['/', '/index.html'].includes(window.location.pathname)) {
      console.log('loading from splash page...');
      setTimeout(() => {
        window.location.href = '/home.html';
      }, 2000);
    }
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
