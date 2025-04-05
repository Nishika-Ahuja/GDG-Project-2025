import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  updateDoc
} from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface FireSafetyVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  transcript: string;
}

interface UserData {
  id: string;
  email: string;
  quizzes?: { [videoId: string]: any[] };
}

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit {
  videos: FireSafetyVideo[] = [];
  currentUser: UserData | null = null;
  routeUserId: string | null = null;

  chatOpen: { [videoId: string]: boolean } = {};
  chatMessages: { [videoId: string]: { role: string, content: string }[] } = {};


  constructor(
    private firestore: Firestore,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.routeUserId = this.route.snapshot.paramMap.get('id');

    if (!this.routeUserId) {
      alert('No user ID in URL');
      return;
    }

    const userDocRef = doc(this.firestore, 'registration', this.routeUserId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      this.currentUser = {
        id: this.routeUserId,
        ...userSnap.data()
      } as UserData;
    } else {
      alert('User not found by ID in URL');
      return;
    }

    const videosCollection = collection(this.firestore, 'fireSafetyVideos');
    collectionData(videosCollection, { idField: 'id' }).subscribe((data) => {
      this.videos = data as FireSafetyVideo[];
    });
  }

  async generateQuiz(video: FireSafetyVideo) {
    this.router.navigate(['/quizzes', video.id], {
      queryParams: { userId: this.routeUserId }
    });

    if (!video.transcript || !this.currentUser) {
      alert('Transcript not available or user not loaded.');
      return;
    }

    const apiKey = 'AIzaSyD7Fq3CRa1tOAgOgEaKczD9_7d3OCinNGk'; 
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Create a 10-question multiple-choice quiz from this transcript:\n\n${video.transcript}
Each question should have:
- 1 question string
- 4 options (A, B, C, D)
- Correct answer as one of A, B, C, D
Return only JSON without markdown or explanations.`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>(url, body, { headers }).subscribe({
      next: async (res) => {
        try {
          let quizText = res?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (!quizText) throw new Error('Empty response from Gemini');

          const cleanedText = quizText
            .replace(/^```json\s*/i, '')
            .replace(/```$/, '')
            .trim();

          const quizData = JSON.parse(cleanedText);

          const userDocRef = doc(this.firestore, 'registration', this.routeUserId!);
          const updatedQuizzes = { ...this.currentUser!.quizzes, [video.id]: quizData };

          await updateDoc(userDocRef, { quizzes: updatedQuizzes });
          this.currentUser!.quizzes = updatedQuizzes;

          alert('Quiz saved successfully!');
        } catch (parseError) {
          console.error('Quiz parsing failed:', parseError);
          alert('Quiz generation failed. Invalid format from Gemini.');
        }
      },
      error: (err) => {
        console.error('Error generating quiz:', err);
        alert('Quiz generation failed.');
      }
    });
  }

  toggleChat(videoId: string) {
    this.chatOpen[videoId] = !this.chatOpen[videoId];
    if (!this.chatMessages[videoId]) {
      this.chatMessages[videoId] = [];
    }
  }

  sendMessage(videoId: string, message: string) {
    if (!message.trim()) return;

    this.chatMessages[videoId].push({ role: 'user', content: message });

    const video = this.videos.find(v => v.id === videoId);
    const transcript = video?.transcript || '';

    const fullPrompt = `Transcript:\n${transcript}\n\nUser's question:\n${message}\n\nPlease answer clearly. If the user's question is not related to the video content, politely respond with: "Kindly ask questions related to the video content only."`;


    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyD7Fq3CRa1tOAgOgEaKczD9_7d3OCinNGk`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>(url, body, { headers }).subscribe({
      next: (res) => {
        const reply = res?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No reply.';
        const formattedReply = reply
  .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')   
  .replace(/\n/g, '<br>');                  

this.chatMessages[videoId].push({ role: 'bot', content: formattedReply });

      },
      error: (err) => {
        console.error('Chat error:', err);
        this.chatMessages[videoId].push({ role: 'bot', content: 'Something went wrong. Try again later.' });
      }
    });
  }
}
