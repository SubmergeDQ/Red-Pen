; 红笔 · Windows 安装程序
; 编译：iscc installer\redpen.iss
; 依赖：client\build\windows\x64\runner\Release 已由 flutter build windows --release 生成

#define AppName "红笔"
#define AppVersion "1.2.0"
#define AppPublisher "Red Pen"
#define AppExe "red_pen.exe"
#define SourceDir "..\client\build\windows\x64\runner\Release"

[Setup]
AppId={{6F1C2A54-3E7B-4D3A-9E1B-2C5D7A9B4E10}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
VersionInfoVersion=1.2.0.5
VersionInfoCompany={#AppPublisher}
VersionInfoDescription={#AppName} 安装程序
VersionInfoProductName={#AppName}
VersionInfoProductVersion={#AppVersion}
DefaultDirName={autopf}\红笔
DefaultGroupName=红笔
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=..\dist\installer
OutputBaseFilename=红笔-1.2.0-windows-x64-setup
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
ShowLanguageDialog=no
SetupIconFile=..\client\windows\runner\resources\app_icon.ico
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
UninstallDisplayName={#AppName}
UninstallDisplayIcon={app}\{#AppExe}
CloseApplications=yes
SetupLogging=yes
AllowNoIcons=yes
; 覆盖安装时让资源管理器刷新图标/关联缓存，否则任务栏与桌面可能继续显示旧图标。
ChangesAssociations=yes

[Languages]
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "创建桌面快捷方式"; GroupDescription: "附加任务："; Flags: checkedonce

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\红笔"; Filename: "{app}\{#AppExe}"; WorkingDir: "{app}"; IconFilename: "{app}\{#AppExe}"; AppUserModelID: "RedPen.Desktop.1"
Name: "{group}\卸载红笔"; Filename: "{uninstallexe}"; IconFilename: "{app}\{#AppExe}"
Name: "{autodesktop}\红笔"; Filename: "{app}\{#AppExe}"; WorkingDir: "{app}"; IconFilename: "{app}\{#AppExe}"; AppUserModelID: "RedPen.Desktop.1"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\RedPen"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\RedPen"; ValueType: string; ValueName: "Version"; ValueData: "{#AppVersion}"; Flags: uninsdeletevalue
Root: HKCU; Subkey: "Software\RedPen"; ValueType: string; ValueName: "Exe"; ValueData: "{app}\{#AppExe}"; Flags: uninsdeletevalue

[Run]
Filename: "{app}\{#AppExe}"; Description: "立即运行红笔"; Flags: nowait postinstall skipifsilent
