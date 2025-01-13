require "json"

def get_react_native_package_path()
  pod_root = Pod::Config.instance.installation_root.to_s
  return `cd "#{pod_root}" && node --print "require.resolve('react-native/package.json')"`.strip!
end

def has_react_native()
  react_native_package_path = get_react_native_package_path()
  return File.exist?(react_native_package_path)
end

def get_react_native_version()
  react_native_package_path = get_react_native_package_path()
  if !File.exist?(react_native_package_path)
    raise "[NitroModules] Couldn't find react-native path! File '#{react_native_package_path}' doesn't exist!"
  end
  react_native_package = JSON.parse(File.read(react_native_package_path))
  react_native_version = react_native_package['version']
  Pod::UI.puts "[NitroModules] Found react-native #{react_native_version} in #{File.dirname(react_native_package_path)}!"
  return react_native_version.split('.')[1].to_i
end
