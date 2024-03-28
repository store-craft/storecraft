export const isEmailValid = (value) => {
    let re = /\S+@\S+\.\S+/;
    return re.test(value)
}

export const isNumberValid = (v, min=Number.NEGATIVE_INFINITY, max=Number.POSITIVE_INFINITY) => {
return (typeof v === 'number') && (v >= min) && (v <= max)
}
  