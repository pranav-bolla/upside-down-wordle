/**
 * Word pools, one per round. Common, friendly, punctuation-free English only.
 * Pools are disjoint by length, so a day can never repeat a word.
 */

// Round 1: 3–4 letters
const SHORT = `
cat dog sun hat map cup bed box key pen bus car egg fan jam leg owl pie toy van
web zoo ant bee cow fox hen pig bat jar log mud net pan rug tea toe ice ink oak
arm sky sea joy pod mow dip
book cake door fish frog game hand jump kite lamp milk moon nest park rain ring
road rock ship shoe snow soap sock star tree wall wave wind wolf bird boat bell
bear corn desk duck farm fork gift goat hill king leaf lion mint nose pear pond
rope salt sand seed song swim tent town vase wood yarn noon bean bike blue coat
coin cook drum fern golf harp idea jazz kiwi lake lime maze moss palm pool sail
soup taxi tuna twig wing zero
`;

// Round 2: 5–6 letters
const MEDIUM = `
apple beach bread chair cloud dance eagle flame grape house juice lemon music
night ocean piano queen river snake table tiger train water whale zebra angel
bacon berry brush candy clock crown daisy dream earth fairy field flute ghost
glove honey horse jelly koala light mango maple melon money mouse onion paint
panda paper peach pearl pizza plant radio robot salad sheep shirt smile spoon
stone storm sugar sweet toast tooth towel truck tulip watch wheel world swims
banana basket bottle bridge butter button camera candle carrot castle cheese
cherry circle coffee cookie dinner doctor dragon engine family finger flower
forest garden guitar hammer island jacket jungle kitten ladder lizard market
mirror monkey muffin orange pencil pepper pillow planet pocket potato puzzle
rabbit rocket school shadow silver spider spring square summer sunset ticket
tomato turtle violin window winter wizard yellow dollop
`;

// Round 3: 7–9 letters
const LONG = `
airport balloon bicycle blanket cabinet captain chicken college cottage country
cupcake diamond dolphin evening feather fiction freedom giraffe holiday journey
kitchen lantern library morning mystery octopus painter pancake penguin picture
popcorn pumpkin rainbow sandbox seaside station teacher thunder tractor village
weather weekend whisper
airplane backpack baseball birthday blizzard building campfire cupboard daughter
dinosaur elephant elevator envelope festival fountain hedgehog hospital keyboard
lemonade magazine medicine midnight mountain mushroom necklace notebook painting
paradise platypus princess question sailboat sandwich scissors shoulder snowball
squirrel starfish sunshine swimming tomorrow treasure triangle umbrella vacation
wardrobe
adventure afternoon alligator astronaut beautiful blueberry breakfast butterfly
chocolate classroom crocodile dandelion fireworks furniture hamburger happiness
jellyfish limestone moonlight newspaper orchestra pepperoni pineapple raspberry
snowflake spaghetti sunflower telephone telescope vegetable wonderful yesterday
`;

function pool(source: string, min: number, max: number): string[] {
  const words = source.split(/\s+/).filter(Boolean);
  return [...new Set(words)].filter((w) => w.length >= min && w.length <= max);
}

/** Index = round. */
export const WORD_POOLS: readonly string[][] = [
  pool(SHORT, 3, 4),
  pool(MEDIUM, 5, 6),
  pool(LONG, 7, 9),
];
