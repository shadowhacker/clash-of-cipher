// Script to upload sound files to Supabase storage
// Usage: node scripts/upload-sounds.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials - replace with your own or use environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || "https://vppefmbjgvfwqqwomfeb.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "your_service_key_here"; // Service key, not anon key

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Sound files to upload
const soundFiles = [
  { 
    localPath: path.join(__dirname, '../public/snd/success_bell.mp3'), 
    remotePath: 'success_bell.mp3'
  },
  { 
    localPath: path.join(__dirname, '../public/snd/failure_bell.mp3'), 
    remotePath: 'failure_bell.mp3'
  },
  { 
    localPath: path.join(__dirname, '../public/snd/victory.mp3'), 
    remotePath: 'victory.mp3'
  },
  { 
    localPath: path.join(__dirname, '../public/snd/intro_sound.mp3'), 
    remotePath: 'intro_sound.mp3'
  }
];

async function uploadSounds() {
  console.log('Starting sound file upload to Supabase...');
  
  // Create the bucket if it doesn't exist
  const { data: bucketData, error: bucketError } = await supabase
    .storage
    .createBucket('sounds', { public: true });
  
  if (bucketError && bucketError.message !== 'Duplicate name') {
    console.error('Error creating bucket:', bucketError);
    return;
  }
  
  // Upload each file
  for (const file of soundFiles) {
    try {
      // Read file content
      const fileContent = fs.readFileSync(file.localPath);
      
      // Upload to Supabase
      const { data, error } = await supabase
        .storage
        .from('sounds')
        .upload(file.remotePath, fileContent, {
          contentType: 'audio/mpeg',
          upsert: true
        });
      
      if (error) {
        console.error(`Error uploading ${file.remotePath}:`, error);
      } else {
        console.log(`Successfully uploaded ${file.remotePath}`);
      }
    } catch (err) {
      console.error(`Error reading or uploading ${file.localPath}:`, err);
    }
  }
  
  // Update the sounds table with the new URLs
  const soundsJson = {
    success: `${SUPABASE_URL}/storage/v1/object/public/sounds/success_bell.mp3`,
    fail: `${SUPABASE_URL}/storage/v1/object/public/sounds/failure_bell.mp3`,
    victory: `${SUPABASE_URL}/storage/v1/object/public/sounds/victory.mp3`,
    intro: `${SUPABASE_URL}/storage/v1/object/public/sounds/intro_sound.mp3`
  };
  
  const { data, error } = await supabase
    .from('sounds')
    .upsert({ 
      sounds_json: soundsJson,
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error updating sounds table:', error);
  } else {
    console.log('Successfully updated sounds table with new URLs');
  }
  
  console.log('Upload process completed');
}

uploadSounds().catch(console.error); 