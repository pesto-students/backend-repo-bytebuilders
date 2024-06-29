const generateOrganisationUniqueId = (companyName) => {
  const cleanName = companyName.toUpperCase().replace(/[^a-zA-Z0-9]/g, "");
  const randomNumber = Math.floor(Math.random() * 10000);
  const uniqueId = `${cleanName}-${randomNumber}`;
  return uniqueId;
};

module.exports = generateOrganisationUniqueId;
