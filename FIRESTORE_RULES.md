# Firestore Security Rules

This file contains the Firestore security rules for the WebMuseum platform. These rules ensure that:

1. Users can only create, update, and delete their own content
2. Public exhibitions are readable by everyone
3. Private exhibitions are only readable by their owners

## Deployment

To deploy these rules to Firebase:

```bash
firebase deploy --only firestore:rules
```

Or use the Firebase Console:
1. Go to Firebase Console > Firestore Database > Rules
2. Copy the contents of `firestore.rules`
3. Paste into the rules editor
4. Click "Publish"

## Rule Structure

### Users Collection
- **Read**: Anyone can read user profiles (public information)
- **Create/Update/Delete**: Only the user themselves can modify their profile

### Exhibitions Collection
- **Read**: 
  - Public exhibitions (`isPublic == true`) are readable by anyone
  - Private exhibitions are only readable by their owner
- **Create**: Only authenticated users can create exhibitions (must set `userId` to their own ID)
- **Update**: Only the owner can update their exhibition (cannot change `userId`)
- **Delete**: Only the owner can delete their exhibition

### Artworks Collection
- **Read**: Anyone can read artworks (they belong to public exhibitions)
- **Create**: Only authenticated users can create artworks (must set `userId` to their own ID)
- **Update**: Only the owner can update their artwork (cannot change `userId`)
- **Delete**: Only the owner can delete their artwork

## Testing

You can test these rules using the Firebase Console Rules Playground or by attempting operations from different user accounts.

