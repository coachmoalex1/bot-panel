ارفع بالترتيب ده (مرة واحدة):
1) GitHub (bot-panel): كل محتويات مجلد 1-github-site (بدّل القديم).
2) Supabase > SQL Editor: الصق وشغّل 2-supabase-sql/setup10.sql
3) Supabase > Edge Functions: الصق وانشر الثلاثة من 3-supabase-functions: super-api و quick-worker و push-notify.
4) Supabase > Edge Functions > Secrets: ضيف TG_ADMIN_BOT_TOKEN = توكن بوت الإشعارات (من BotFather). مش في الكود أبداً.
5) اربط البوت بالدالة (مرة): افتح في المتصفح
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://aqmlkutbonkqaozeayot.supabase.co/functions/v1/push-notify?k=<BOT_SECRET>
6) افتح التطبيق > امسح كاش المتصفح مرة واحدة عشان الأيقونة الجديدة تظهر.
(مفاتيح VAPID وويبهوك notifications من التعليمات القديمة لو ما اتعملوش.)
