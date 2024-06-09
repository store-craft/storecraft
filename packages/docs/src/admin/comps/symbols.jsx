
export const WhiteSpace = ({n = 1}) => {
  return (
    <>
    {
      Array.from({length: n}).map((it, ix) => (
        <span key={ix}>&nbsp;</span>
      ))
    }
    </>
  )
}

export const SpaceShip = () => {
  return (
    <span>🚀</span>
  )
}