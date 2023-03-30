Para que el proyecto compile es necesario abrir el archivo:
platforms/android/app/src/main/java/com/ionicframework/cordova/webview/IonicWebViewEngine.java


Luego comentar la linea
//import android.support.annotation.RequiresApi;
Y agregar
import androidx.annotation.RequiresApi;

Más información en: https://github.com/ionic-team/cordova-plugin-ionic-webview/issues/489