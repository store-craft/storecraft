/**
 * @param {Error} error 
 */
export const extractStack = (error) => {
  if(!error && !error.stack && !(typeof error.stack === 'string')) {
    return '';
  }

  const stackRegex = /(?:\n {4}at .*)+/;
	const stack = error.stack;

	if (!stack) {
		return '';
	}

	const match = stack?.match(stackRegex);

	if (!match) {
		return '';
	}

	return match[0].slice(1);
};
