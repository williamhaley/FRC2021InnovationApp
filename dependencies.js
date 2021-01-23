const version = 'v1.0.15';

console.log(`dependencies:version ${version}`);

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

window.addEventListener('appinstalled', function (event) {
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
window.addEventListener('DOMContentLoaded', function () {
  let displayMode = 'unknown (probably web)';
  if (navigator.standalone) {
    displayMode = 'standalone';
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    displayMode = 'standalone-media';
  }
  console.log(`dependencies:displayMode ${displayMode}`);

  window.addEventListener('online', function () {
    console.log('dependencies:online status changed to online');
  }, false);

  window.addEventListener('offline', function () {
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

window.addEventListener('load', async function () {
  let $version = document.createElement('span');
  $version.textContent = version;
  document.querySelector('footer').appendChild($version);

  const res = await fetch('/manifest.json');
  await res.text();
  console.log('dependencies:load test fetch complete');
});

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

function haversineDistance(positionA, positionB) {
  // Radius of the Earth in miles. But earth is not a perfect sphere so this
  // only makes sense for short distances.
  const R = 3958.8;
  const rlat1 = positionA.lat * (Math.PI/180); // Convert degrees to radians
  const rlat2 = positionB.lat * (Math.PI/180); // Convert degrees to radians
  const difflat = rlat2-rlat1; // Radian difference (latitudes)
  const difflon = (positionA.lng - positionB.lng) * (Math.PI/180); // Radian difference (longitudes)

  const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  return d;
}

/**
 * getCurrentPosition returns the current geolocation.
 */
async function getCurrentPosition() {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        console.log('dependencies:getCurrentPosition success', position);
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      function (error) {
        console.log('dependencies:getCurrentPosition error', error);
        reject(error);
      },
    );
  });
}

/**
 * sleep waits for a given number of milliseconds, which is useful if we want
 * to wait for a given amount of time to pass.
 * @param {number} timeInMs
 */
async function sleep(timeInMs) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, timeInMs)
  });
}

/**
 * trackSpeed continually tracks the speed of the device.
 */
async function trackSpeed() {
  let previousPosition = null;
  let previousTime = null;

  // The total distance moved is an interesting data point.
  let totalDistance = 0;

  // Keep trying until we get the device's position.
  while (previousPosition === null) {
    const position = await getCurrentPosition();
    console.log(`dependencies:trackSpeed initial position ${JSON.stringify(position)}`);
    previousPosition = position;
    previousTime = Date.now();
  }

  // Loop forever to keep checking speed.
  while (true) {
    const newPosition = await getCurrentPosition();
    const newTime = Date.now();
    console.log(`dependencies:trackSpeed new position ${JSON.stringify(newPosition)}`);

    let distance = haversineDistance(previousPosition, newPosition);
    totalDistance += distance;
    console.log(`dependencies:trackSpeed:distance ${distance}`);
    console.log(`dependencies:trackSpeed:totalDistance ${totalDistance}`);

    let timeElapsedInSeconds = (newTime - previousTime) / 1000;
    console.log(`dependencies:trackSpeed:timeElapsedInSeconds ${timeElapsedInSeconds}`);

    previousPosition = newPosition;
    previousTime = newTime;

    const factor = timeElapsedInSeconds / 3600;
    const speed = totalDistance * factor;
    console.log(`dependencies:trackSpeed speed ${speed} mi/h`);

    // Wait a second.
    await sleep(1000);
  }
}

trackSpeed();
