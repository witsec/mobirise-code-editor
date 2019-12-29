// Function to translate JSON to CSS
function json2css(json)
{
	var css = "";
	var prevdepth = 0;

	function eachRecursive(obj, depth=0)
	{
		for (var k in obj) {
			// Indentation
			var spaces = " ".repeat(depth * 2);

			// If we're getting another hash, dive deeper
			if (typeof obj[k] == "object" && obj[k] !== null) {
				// Let's not have a white line as first line
				css += (css ? "\n" : "");

				// Open brackets
				css += spaces + k + " {\n";

				// Dive deeper
				eachRecursive(obj[k], depth+1);
			} else {
				// Write the css
				css += spaces + k + ": " + obj[k] + ";\n";
			}

			// If current depth is less than previous depth, we've exited a hash, so let's place a closing bracket
			if (depth < prevdepth || JSON.stringify(obj[k]) == "{}") {
				css += spaces + "}\n";
			}
			prevdepth = depth;
		}
	}

	// Go!
	eachRecursive(json);

	// Return beautiful css :)
	return css.trim();
}