# Firebase Storage Setup Instructions

## Para ma-enable ang image upload sa collections:

1. **Adto sa Firebase Console**
   - Open: https://console.firebase.google.com
   - Pili ang project: `dishcovery-d12f5`

2. **Enable Firebase Storage**
   - Click sa "Build" > "Storage" sa left sidebar
   - Kung wala pa enabled, click "Get Started"

3. **Configure Storage Rules**
   - Click sa "Rules" tab sa taas
   - Replace ang existing rules with this:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload collection images
    match /collections/{userId}/{collectionId}/{fileName} {
      allow read: if true; // Anyone can read
      allow write: if request.auth != null && request.auth.uid == userId; // Only owner can write
    }
    
    // Default deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

4. **Click "Publish"** para ma-save ang rules

## Test kung working:
- Try create ug collection with image
- Dapat instant lang mo-create ug walay delay
- Ang image ma-display sa collection card

## Troubleshooting:
- Kung naa pa gihapon issue, check sa browser console para sa error details
- Make sure naka-login ka sa Google account
- Refresh ang page after changing Storage Rules
