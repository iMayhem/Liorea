// src/lib/db.ts
import { supabase } from './supabase';
import type { UserProfile, CustomTimetable, UserProgress, TimeTableData } from './types';
import { generateInitialProgressForDate } from './data';

// --- USER ---

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!uid) return null;
    const { data } = await supabase.from('users').select('*').eq('id', uid).single();
    if (!data) return null;
    return {
        uid: data.id,
        username: data.username,
        email: data.email,
        photoURL: data.photo_url,
        lastSeen: data.last_seen,
        totalStudyHours: data.total_study_hours || 0,
        dailyStreak: data.daily_streak || 0,
        customTimetable: data.custom_timetable,
        feeling: data.feeling,
        role: data.role
    };
}

export async function updateUserProfile(uid: string, data: any) {
    if (!uid) return { error: "No User ID" };
    
    const updateData: any = {};
    if (data.username) updateData.username = data.username;
    if (data.feeling) updateData.feeling = data.feeling;
    if (data.lastNotificationCheck) updateData.last_notification_check = data.lastNotificationCheck;
    
    const { error } = await supabase.from('users').update(updateData).eq('id', uid);
    
    if (error) {
        console.error("[DB] Update Failed:", error.message);
        return { error: error.message };
    }
    
    return { error: null };
}

export async function checkUsernameUnique(username: string): Promise<boolean> {
    const { data } = await supabase.from('users').select('id').eq('username', username).maybeSingle();
    return !data;
}

// --- TIMETABLE & PROGRESS ---

export async function getUserTimetable(uid: string): Promise<CustomTimetable | null> {
    if (!uid) return null;
    const { data } = await supabase.from('users').select('custom_timetable').eq('id', uid).single();
    return data?.custom_timetable || null;
}

export async function saveUserTimetable(uid: string, timetable: CustomTimetable) {
    if (!uid) return;
    await supabase.from('users').update({ custom_timetable: timetable }).eq('id', uid);
}

export async function getProgressForUser(username: string, date: string, timetable: TimeTableData): Promise<UserProgress> {
    if (!username) return generateInitialProgressForDate(timetable);
    
    const { data: user } = await supabase.from('users').select('id').eq('username', username).single();
    if (!user) return generateInitialProgressForDate(timetable);

    const docId = `${user.id}-${date}`;
    const { data } = await supabase.from('progress').select('data').eq('id', docId).single();
    
    if (data) return data.data;
    return generateInitialProgressForDate(timetable);
}

export async function updateTask(username: string, day: string, subject: string, task: string, isCompleted: boolean) {
    const { data: user } = await supabase.from('users').select('id').eq('username', username).single();
    if (!user) return;

    const docId = `${user.id}-${day}`;
    const { data: existing } = await supabase.from('progress').select('data').eq('id', docId).single();
    
    let progressData = existing?.data || {};
    if (!progressData[day]) progressData[day] = {};
    if (!progressData[day][subject]) progressData[day][subject] = {};
    progressData[day][subject][task] = isCompleted;

    await supabase.from('progress').upsert({ id: docId, user_id: user.id, date: day, data: progressData });
}

export async function updateScore(username: string, day: string, subject: string, score: number) {
    const { data: user } = await supabase.from('users').select('id').eq('username', username).single();
    if (!user) return;

    const docId = `${user.id}-${day}`;
    const { data: existing } = await supabase.from('progress').select('data').eq('id', docId).single();
    
    let progressData = existing?.data || {};
    if (!progressData[day]) progressData[day] = {};
    if (!progressData[day][subject]) progressData[day][subject] = {};
    progressData[day][subject]['score'] = score;

    await supabase.from('progress').upsert({ id: docId, user_id: user.id, date: day, data: progressData });
}

// --- STUDY TRACKING ---

export async function logStudySession(uid: string, seconds: number) {
    // Optimistic log
    const { data: user } = await supabase.from('users').select('total_study_hours').eq('id', uid).single();
    const newTotal = (user?.total_study_hours || 0) + seconds;
    await supabase.from('users').update({ total_study_hours: newTotal }).eq('id', uid);
}

// --- MISC ---

export async function submitReport(reportData: any) {
    await supabase.from('reports').insert({
        user_id: reportData.userId,
        username: reportData.username,
        title: reportData.title,
        description: reportData.description,
        status: 'open'
    });
}

export async function getLeaderboardData(type: string) {
    const { data } = await supabase.from('users')
        .select('id, username, photo_url, total_study_hours')
        .order('total_study_hours', { ascending: false })
        .limit(50);
    
    return (data || []).map(u => ({
        uid: u.id,
        username: u.username,
        photoURL: u.photo_url,
        totalStudyHours: u.total_study_hours,
        dailyStreak: 0,
        lastSeen: '',
        createdAt: ''
    }));
}

export async function getMonthlyStudyInsights(date: Date) {
    return [];
}

export async function getStudyLogsForUser(uid: string) {
    if (!uid) return {};
    return {}; 
}