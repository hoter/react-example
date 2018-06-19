export function mapUserEntity (userEntity) {
  const user = Object.assign({}, userEntity.entityData);
  user.id = userEntity.entityKey.id;
  delete user.auth;
  return user;
}

export function mapSocialProfile (profile) {
  return {
    id: profile.id,
    displayName: profile.displayName,
    provider: profile.provider
  };
};