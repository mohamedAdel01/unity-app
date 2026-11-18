import UIKit
import Capacitor
import UserNotifications
import FirebaseCore
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate, MessagingDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        print("======================================================================")
        print("🍏 [iOS-NOTIF: 1_LAUNCH] AppDelegate didFinishLaunchingWithOptions called")
        print("🍏 [iOS-NOTIF: 1_TIME] \(ISO8601DateFormatter().string(from: Date()))")

        // 1. Initialize Firebase App
        FirebaseApp.configure()
        print("🍏 [iOS-NOTIF: 2_FIREBASE_CONFIG] FirebaseApp.configure() executed successfully")

        // 2. Assign Firebase Messaging Delegate
        Messaging.messaging().delegate = self
        print("🍏 [iOS-NOTIF: 3_MESSAGING_DELEGATE] Messaging.messaging().delegate = self registered")

        // 3. Assign UNUserNotificationCenter Delegate (CRITICAL for Foreground Notifications)
        UNUserNotificationCenter.current().delegate = self
        print("🍏 [iOS-NOTIF: 4_UN_DELEGATE] UNUserNotificationCenter.current().delegate = self registered")

        // 4. Inspect Launch Options for Remote Notifications
        if let remoteNotifPayload = launchOptions?[.remoteNotification] as? [AnyHashable: Any] {
            print("🔔 [iOS-NOTIF: 5_LAUNCHED_VIA_PUSH] App launched via remote push notification!")
            print("   Payload: \(remoteNotifPayload)")
        } else {
            print("ℹ️ [iOS-NOTIF: 5_NORMAL_LAUNCH] App launched normally (not via remote push)")
        }
        print("======================================================================")

        return true
    }

    // MARK: - APNs Remote Notifications Registration

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
        let apnsTokenHex = tokenParts.joined()

        print("\n======================================================================")
        print("🍏 [iOS-NOTIF: APNs_SUCCESS] Native Apple APNs Registration SUCCEEDED!")
        print("🍏 [iOS-NOTIF: APNs_TOKEN_BYTES] \(deviceToken.count) bytes")
        print("🍏 [iOS-NOTIF: APNs_HEX_TOKEN] \(apnsTokenHex)")
        print("🍏 [iOS-NOTIF: APNs_HEX_LENGTH] \(apnsTokenHex.count) characters")
        print("======================================================================")

        // Forward raw APNs deviceToken to Firebase Messaging SDK
        Messaging.messaging().apnsToken = deviceToken
        print("🔥 [iOS-NOTIF: FIREBASE_LINK] Passed deviceToken to Messaging.messaging().apnsToken successfully.")

        // Notify Capacitor Push Notifications Plugin
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        print("📲 [iOS-NOTIF: CAPACITOR_NOTIFIED] Posted .capacitorDidRegisterForRemoteNotifications event.\n")
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("\n======================================================================")
        print("❌ [iOS-NOTIF: APNs_REGISTRATION_FAILED] Apple APNs Registration Failed!")
        print("❌ [iOS-NOTIF: ERROR_DESCRIPTION] \(error.localizedDescription)")
        let nsError = error as NSError
        print("❌ [iOS-NOTIF: ERROR_DOMAIN] \(nsError.domain), Code: \(nsError.code)")
        print("❌ [iOS-NOTIF: ERROR_USER_INFO] \(nsError.userInfo)")
        print("----------------------------------------------------------------------")
        print("⚠️ DIAGNOSTIC CHECKLIST FOR iOS APNs FAILURE:")
        print("   1. Code 3000 / 'no valid aps-environment': Push Notifications capability missing in App.entitlements.")
        print("   2. iOS Simulator: Standard iOS Simulators do NOT support APNs; test on a physical iOS device.")
        print("   3. Provisioning Profile: Ensure Bundle ID has 'Push Notifications' enabled in Apple Developer Portal.")
        print("======================================================================\n")

        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ application: UIApplication,
                     didReceiveRemoteNotification userInfo: [AnyHashable: Any],
                     fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        print("\n======================================================================")
        print("📨 [iOS-NOTIF: REMOTE_MSG_RECEIVED] Remote Notification received by system!")
        print("📨 [iOS-NOTIF: PAYLOAD] \(userInfo)")
        print("======================================================================\n")

        // Pass message to Firebase Messaging SDK (Required when FirebaseAppDelegateProxyEnabled is false)
        Messaging.messaging().appDidReceiveMessage(userInfo)

        // Pass to Capacitor
        NotificationCenter.default.post(name: Notification.Name("capacitorDidReceiveRemoteNotification"), object: userInfo)

        completionHandler(.newData)
    }

    // MARK: - Firebase MessagingDelegate (Direct FCM Token Reception)

    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        print("\n======================================================================")
        if let token = fcmToken, !token.isEmpty {
            print("🔥 [iOS-NOTIF: FCM_TOKEN_SUCCESS] Firebase Messaging SDK generated direct FCM Token!")
            print("🔥 [iOS-NOTIF: FCM_TOKEN_LENGTH] \(token.count) characters")
            print("🔥 [iOS-NOTIF: FCM_TOKEN_FULL] \(token)")
            print("🔥 [iOS-NOTIF: FCM_TOKEN_PREVIEW] \(token.prefix(25))...\(token.suffix(20))")
        } else {
            print("⚠️ [iOS-NOTIF: FCM_TOKEN_EMPTY] didReceiveRegistrationToken called but token was nil or empty.")
        }
        print("======================================================================\n")
    }

    // MARK: - UNUserNotificationCenterDelegate (Foreground & Interaction)

    // Called when a notification is delivered to a FOREGROUND app
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        let userInfo = notification.request.content.userInfo
        let title = notification.request.content.title
        let body = notification.request.content.body
        let badge = notification.request.content.badge

        print("\n======================================================================")
        print("🔔 [iOS-NOTIF: FOREGROUND_PRESENTATION] Push Notification received in FOREGROUND!")
        print("🔔 [iOS-NOTIF: TITLE] \"\(title)\"")
        print("🔔 [iOS-NOTIF: BODY] \"\(body)\"")
        if let b = badge {
            print("🔔 [iOS-NOTIF: BADGE] \(b)")
        }
        print("🔔 [iOS-NOTIF: USER_INFO] \(userInfo)")
        print("🔔 [iOS-NOTIF: ACTION] Showing banner, sound, badge & list presentation options...")
        print("======================================================================\n")

        // Display banner, sound, badge, and add to Notification Center
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge, .list])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }

    // Called when the user TAPS on a notification banner or lock-screen item
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo
        let title = response.notification.request.content.title
        let actionId = response.actionIdentifier

        print("\n======================================================================")
        print("👆 [iOS-NOTIF: NOTIFICATION_TAPPED] User tapped notification from notification center/banner!")
        print("👆 [iOS-NOTIF: TITLE] \"\(title)\"")
        print("👆 [iOS-NOTIF: ACTION_IDENTIFIER] \(actionId)")
        print("👆 [iOS-NOTIF: USER_INFO] \(userInfo)")
        print("======================================================================\n")

        completionHandler()
    }

    // MARK: - Application Lifecycle

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        print("📱 [iOS-LIFECYCLE] App entered BACKGROUND")
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        print("📱 [iOS-LIFECYCLE] App will enter FOREGROUND")
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        print("📱 [iOS-LIFECYCLE] App became ACTIVE")
    }

    func applicationWillTerminate(_ application: UIApplication) {
        print("📱 [iOS-LIFECYCLE] App will TERMINATE")
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}
