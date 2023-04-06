export const fillNumberWithZeros = ({ number, length }) => {
	const digitesOfNumber = number.toString().length;
	const countOfZeros = length - digitesOfNumber;
	if (countOfZeros > 0) return `${"0".repeat(countOfZeros)}${number}`;
	return number;
};
