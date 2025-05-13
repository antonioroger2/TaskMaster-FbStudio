"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Palette, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { db, auth as firebaseAuth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton"; // Added import for Skeleton

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Profile States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  // Notification States
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);

  // Appearance States
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Loading States
  const [isFetchingSettings, setIsFetchingSettings] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (user) {
        setIsFetchingSettings(true);
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Profile
            setName(userData.displayName || user.displayName || user.email?.split('@')[0] || "User");
            setEmail(userData.email || user.email || "");
            setBio(userData.bio || "");
            // Notifications
            setEmailNotificationsEnabled(userData.settings?.notifications?.email ?? false);
            setPushNotificationsEnabled(userData.settings?.notifications?.push ?? false);
            // Appearance
            setDarkModeEnabled(userData.settings?.appearance?.darkMode ?? false);
          } else {
            // Document doesn't exist, create it with defaults
            const defaultDisplayName = user.displayName || user.email?.split('@')[0] || "User";
            const userEmail = user.email || "";
            const initialSettings = {
              email: userEmail,
              displayName: defaultDisplayName,
              bio: "",
              createdAt: new Date().toISOString(),
              settings: {
                notifications: { email: false, push: false },
                appearance: { darkMode: false }
              }
            };
            await setDoc(userDocRef, initialSettings);
            setName(defaultDisplayName);
            setEmail(userEmail);
            setBio("");
            setEmailNotificationsEnabled(initialSettings.settings.notifications.email);
            setPushNotificationsEnabled(initialSettings.settings.notifications.push);
            setDarkModeEnabled(initialSettings.settings.appearance.darkMode);
          }
        } catch (error) {
          console.error("Error fetching/creating user settings:", error);
          toast({ title: "Error", description: "Failed to load settings.", variant: "destructive" });
          // Fallback to auth data for profile if Firestore fails
          setName(user.displayName || user.email?.split('@')[0] || "User");
          setEmail(user.email || "");
          setBio("");
        } finally {
          setIsFetchingSettings(false);
        }
      } else if (!authLoading) {
        setIsFetchingSettings(false); 
      }
    };

    if (!authLoading) {
        fetchUserSettings();
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    // Apply dark mode based on fetched preference
    // This runs when darkModeEnabled changes or after settings are fetched.
    if (typeof window !== 'undefined') {
      if (darkModeEnabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkModeEnabled]);


  const handleProfileSaveChanges = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: name,
        bio: bio,
        updatedAt: new Date().toISOString(),
      });

      if (firebaseAuth.currentUser && firebaseAuth.currentUser.uid === user.uid && firebaseAuth.currentUser.displayName !== name) {
        await updateProfile(firebaseAuth.currentUser, { displayName: name });
      }
      toast({ title: "Settings Updated", description: "Profile settings have been saved." });
    } catch (error) {
      console.error("Error updating profile settings:", error);
      toast({ title: "Error", description: "Failed to update profile settings.", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  const handleNotificationSaveChanges = async () => {
    if (!user) return;
    setIsSavingNotifications(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        "settings.notifications.email": emailNotificationsEnabled,
        "settings.notifications.push": pushNotificationsEnabled,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: "Settings Updated", description: "Notification settings have been saved." });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast({ title: "Error", description: "Failed to save notification settings.", variant: "destructive" });
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleAppearanceSaveChanges = async () => {
    if (!user) return;
    setIsSavingAppearance(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        "settings.appearance.darkMode": darkModeEnabled,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: "Settings Updated", description: "Appearance settings have been saved." });
    } catch (error) {
      console.error("Error updating appearance settings:", error);
      toast({ title: "Error", description: "Failed to save appearance settings.", variant: "destructive" });
    } finally {
      setIsSavingAppearance(false);
    }
  };

  if (authLoading || isFetchingSettings) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        {[1,2,3].map(i => (
          <Card key={i} className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl"><Loader2 className="mr-3 h-6 w-6 text-primary animate-spin" /> Loading Settings...</CardTitle>
              <CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter className="border-t px-6 py-4"><Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</Button></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <User className="mr-3 h-6 w-6 text-primary" /> Profile Settings
          </CardTitle>
          <CardDescription>Manage your personal information and account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSavingProfile} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Input id="bio" placeholder="Tell us a bit about yourself" value={bio} onChange={(e) => setBio(e.target.value)} disabled={isSavingProfile} />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleProfileSaveChanges} disabled={isSavingProfile}>
            {isSavingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Profile"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Bell className="mr-3 h-6 w-6 text-primary" /> Notification Settings
          </CardTitle>
          <CardDescription>Control how you receive notifications from TaskMaster.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Receive emails for task reminders and updates.
              </span>
            </Label>
            <Switch 
              id="email-notifications" 
              checked={emailNotificationsEnabled}
              onCheckedChange={setEmailNotificationsEnabled}
              disabled={isSavingNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
              <span>Push Notifications</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Get real-time alerts on your devices. (Requires setup)
              </span>
            </Label>
            <Switch 
              id="push-notifications" 
              checked={pushNotificationsEnabled}
              onCheckedChange={setPushNotificationsEnabled}
              disabled={isSavingNotifications} />
          </div>
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleNotificationSaveChanges} disabled={isSavingNotifications}>
            {isSavingNotifications ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Notifications"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Palette className="mr-3 h-6 w-6 text-primary" /> Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of TaskMaster.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
              <span>Dark Mode</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Toggle between light and dark themes.
              </span>
            </Label>
            <Switch 
              id="dark-mode" 
              checked={darkModeEnabled}
              onCheckedChange={setDarkModeEnabled} // State change triggers useEffect to apply class
              disabled={isSavingAppearance}
            />
          </div>
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleAppearanceSaveChanges} disabled={isSavingAppearance}>
             {isSavingAppearance ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Appearance"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <ShieldCheck className="mr-3 h-6 w-6 text-primary" /> Account Security
          </CardTitle>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Button variant="outline">Change Password</Button>
           <p className="text-sm text-muted-foreground">
            Regularly updating your password helps keep your account secure.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
