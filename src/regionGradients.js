export const regionGradients = {
  tarifa: 'bg-gradient-to-br from-rose-500 to-orange-500',
  capetown: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  holland: 'bg-gradient-to-br from-orange-500 to-amber-500',
  sweden: 'bg-gradient-to-br from-blue-500 to-indigo-500',
  myspots: 'bg-gradient-to-br from-amber-500 to-yellow-500',
};

export function getRegionGradient(regionId) {
  return regionGradients[regionId] || '';
}
