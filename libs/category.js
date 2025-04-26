// Esta funcion toma una fecha de nacimiento y devuelve el ID de la categoría correspondiente

export function getCategoryIdByBirthDate(birthDate) {
  const birthYear = new Date(birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const ageByYear = currentYear - birthYear;

  if (ageByYear <= 12) {
    // Alevín (ID = 3)
    return 3;
  } else if (ageByYear <= 14) {
    // Infantil (ID = 4)
    return 4;
  } else if (ageByYear <= 16) {
    // Cadete (ID = 5)
    return 5;
  } else if (ageByYear <= 18) {
    // Juvenil (ID = 6)
    return 6;
  } else {
    // Sénior (ID = 9)
    return 9;
  }
}
