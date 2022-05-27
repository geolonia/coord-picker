export const parseHash = () => {
	const [z, lat, lng] = window.location.hash.substring(1).split('/');
	return { z: parseFloat(z), lat: parseFloat(lat), lng: parseFloat(lng) };
};
