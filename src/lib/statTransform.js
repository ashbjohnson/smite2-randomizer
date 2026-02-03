const stat = (shortcut) => new RegExp(`{{${shortcut}\\|(\\d+)}}`, 'g')
const transform = (shortcut, replacement) => (input) => input.replaceAll(stat(shortcut), replacement);

const movementSpeedTransform = transform("MS", "+$1% Movement Speed");
const flatMagProtTransform = transform("MProt", "+$1 Magical Protections");
const flatPhysProtTransform = transform("PProt", "+$1 Physical Protections");
const cdrTransform = transform("CDR", "+$1% Cooldown Reduction")

const statTransform = (input) => [movementSpeedTransform, flatMagProtTransform, flatPhysProtTransform, cdrTransform].reduce((output, fn) => fn(output), input);

export default statTransform;