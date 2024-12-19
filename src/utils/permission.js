const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    // Options specifically tuned for mobile
    const options = {
      enableHighAccuracy: true,    // Use GPS on mobile
      timeout: 10000,              // 10 second timeout
      maximumAge: 0                // Don't use cached position
    };

    // Watch position instead of getting once
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        navigator.geolocation.clearWatch(watchId); // Clear after getting accurate position
      },
      (error) => {
      alert(error.message);

        let message;
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = 'Please enable location access in your device settings';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location unavailable. Check if GPS is enabled';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again';
            break;
          default:
            message = 'An unknown error occurred';
        }
        reject(new Error(message));
      },
      options
    );
  });
};
  
  export { getCurrentLocation };