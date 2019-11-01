function hasPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  );
  if (!matchedPermissions.length) {
    throw new Error(`You do not have sufficient permissions

      : ${permissionsNeeded}

      You Have:

      ${user.permissions}
      `);
  }
}

function isUserLoggedin(ctx) {
  if(!ctx.request.userId) {
    throw new Error('You must be logged in!');
  }
}

exports.hasPermission = hasPermission;
exports.isUserLoggedin = isUserLoggedin;
