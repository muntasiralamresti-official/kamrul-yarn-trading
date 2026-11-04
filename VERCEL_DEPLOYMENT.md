# Kamrul Yarn Trading - Vercel Deployment Guide

এই প্রজেক্টটি Vercel-এ ডিপ্লয় করার জন্য প্রস্তুত করা হয়েছে।

---

### ধাপ ১: GitHub-এ কোড পুশ করুন
1. আপনার লোকাল প্রজেক্টটিকে একটি নতুন GitHub রিপোজিটরিতে পুশ করুন:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/kamrul-yarn-trading.git
   git push -u origin main
   ```

---

### ধাপ ২: MongoDB Atlas ক্লাউড ডেটাবেজ সেটআপ
যেহেতু Vercel ক্লাউডে চলবে, তাই লোকাল `mongodb://localhost:27017` সেখানে কাজ করবে না।
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) এ একটি ফ্রি ক্লাস্টার তৈরি করুন।
2. **Network Access** এ `0.0.0.0/0` (Allow access from anywhere) অ্যাড করুন।
3. **Database Access** এ গিয়ে একটি ইউজারনেম ও পাসওয়ার্ড তৈরি করুন।
4. কানেকশন স্ট্রিংটি কপি করুন:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/kamrul-yarn-trading?retryWrites=true&w=majority`

---

### ধাপ ৩: Vercel-এ ইম্পোর্ট ও ডিপ্লয়
1. [vercel.com](https://vercel.com) এ লগইন করুন।
2. **Add New... &rarr; Project** সিলেক্ট করে আপনার GitHub রিপোজিটরিটি ইম্পোর্ট করুন।
3. **Environment Variables** সেকশনে নিচের ভ্যারিয়েবলটি যোগ করুন:
   - **Key:** `MONGO_URI`
   - **Value:** আপনার MongoDB Atlas কানেকশন স্ট্রিং।
   - *(ঐচ্ছিক)* `NODE_ENV`: `production`
4. **Deploy** বাটনে ক্লিক করুন।

Vercel স্বয়ংক্রিয়ভাবে ফ্রন্টএন্ড এবং ব্যাকএন্ড API বিল্ড করে একটি লাইভ ডোমেইন (যেমন: `https://kamrul-yarn-trading.vercel.app`) প্রদান করবে।
