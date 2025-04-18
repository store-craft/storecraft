
export const extractStack = (error) => {
  const stackRegex = /(?:\n {4}at .*)+/;
	const stack = error instanceof Error ? error.stack : error;

	if (!stack) {
		return '';
	}

	const match = stack.match(stackRegex);

	if (!match) {
		return '';
	}

	return match[0].slice(1);
};

// extractStack.lines = stack => extractStack(stack).replace(/^ {4}at /gm, '').split('\n');
