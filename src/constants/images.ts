const Images = {
  burger1: require('../../assets/images/burger1.png'),
  burger2: require('../../assets/images/burger2.png'),
  burger3: require('../../assets/images/burger3.png'),
  burger4: require('../../assets/images/burger4.png'),
  burger5: require('../../assets/images/burger5.png'),
  toppingTomato: require('../../assets/images/toppingtomato.png'),
  toppingOnion: require('../../assets/images/toppingonion.png'),
  toppingPickles: require('../../assets/images/toppingpickle.png'),
  toppingBacon: require('../../assets/images/toppingbacon.png'),
  sideFries: require('../../assets/images/side_fries.png'),
  sideOnionRings: require('../../assets/images/side_onion_rings.png'),    
  sideSalad: require('../../assets/images/side_salad.png'),
  sideColeslaw: require('../../assets/images/side_coleslaw.png'),
  burgerStack: require('../../assets/images/burger_stack.png'),
  avatarPlaceholder: require('../../assets/images/profile.png'),
  maggie: require('../../assets/images/maggie_family.png'),
  maggie_family: require('../../assets/images/maggie_family_pack.png'),
  noodles: require('../../assets/images/hakka_noodles.png'),
  schezwan: require('../../assets/images/chicken_schezwan_noodles.png'),
  cup: require('../../assets/images/cup_noodles.png'),
};

export default Images;

// Map filenames (from products.json) to actual require() image assets.
// If you later add real images to assets/images with these filenames,
// update this map to point to the new files.
export const ImageMap: Record<string, any> = {
  'maggie_noodles.png': Images.maggie,
  'maggie_family.png': Images.maggie_family,
  'veg_hakka_noodles.png': Images.noodles,
  'chicken_schezwan.png': Images.schezwan,
  'cup_noodles_masala.png': Images.cup,
};

export function imageByName(name?: string) {
  if (!name) return Images.burgerStack;
  return ImageMap[name] || Images.burgerStack;
}
