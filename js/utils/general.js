// for async/await functions successful compiling into ES6
import "../../node_modules/regenerator-runtime/runtime.js";

const $ = document;

async function myFetch(...args) {
	const [url, options] = args;

	const response = await fetch(url, options);

	if (response.status >= 200 && response.status <= 299 && response.ok) {
		return response.json();
	} else {
		throw Error(`An error occurred with status ${response.status}`);
	}
}

export { $, myFetch };
