require 'rubygems'
require 'net/http'
require 'rake/clean'
require 'packr'
require 'fileutils'
include FileUtils
  
task :default => :test

# list of browsers to auto-bind to JsTestDrive Server
# non-existent browsers will be ignored
BROWSERS = [
  '/Applications/Safari.app/Contents/MacOS/Safari',
  '/Applications/Firefox.app/Contents/MacOS/firefox',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Opera.app/Contents/MacOS/Opera',
  'C:/Program Files/Mozilla Firefox/firefox.exe',
  'C:/Program Files/Internet Explorer/iexplore.exe',
  'C:/Program Files/Safari/Safari.exe',
  'C:/Program Files/Opera/opera.exe' ]


desc "Builds a release"
task :build => [:clean] do
  # build dist and lib directories
  mkdir 'dist'
  mkdir 'dist/lib'
  mkdir 'dist/example'

  # copy src
  cp 'src/pavlov.js', 'dist/pavlov.js'
  
  # copy documentation
  cp 'doc/GPL-LICENSE.txt', 'dist/GPL-LICENSE.txt'
  cp 'doc/MIT-LICENSE.txt', 'dist/MIT-LICENSE.txt'
  cp 'README.markdown', 'dist/README.markdown'

  # copy lib
  cp 'lib/qunit/qunit.js', 'dist/lib/qunit.js'
  cp 'lib/qunit/qunit.css', 'dist/lib/qunit.css'
  cp 'lib/jquery/GPL-LICENSE.txt', 'dist/lib/GPL-LICENSE.txt'
  cp 'lib/jquery/MIT-LICENSE.txt', 'dist/lib/MIT-LICENSE.txt'
  
  # copy example
  cp 'doc/example/example.specs.html', 'dist/example/example.specs.html'
  cp 'doc/example/example.specs.js', 'dist/example/example.specs.js'

  
  # minify src
  source = File.read('dist/pavlov.js')
  minified = Packr.pack(source, :shrink_vars => true, :base62 => false)

  # inject header
  File.open('dist/pavlov.min.js', 'w') do |combined|
    combined.puts(IO.read('src/header.js'))
    combined.write(minified)  
  end
end


desc "Run the tests in default browser"
task :test => [:build] do  
  begin
    # mac
    sh("open spec/pavlov.specs.html")
  rescue
    # windows
    sh("start spec/pavlov.specs.html")
  end
end


desc "Run the tests against JsTestDriver"
task :testdrive => [:build] do
  sh("java -jar lib/js-test-driver/JsTestDriver.jar --tests all --captureConsole --reset")
end


desc "Start the JsTestDriver server"
task :server => [:install_server] do
  browsers = BROWSERS.find_all{|b| File.exists? b}.join(',')
  sh("java -jar lib/js-test-driver/JsTestDriver.jar --port 9876 --browser \"#{browsers}\"")
end


desc "Download Google JsTestDriver"
task :install_server do
  if !File.exist?('lib/js-test-driver/JsTestDriver.jar') then
    puts 'Downloading JsTestDriver from Google (http://js-test-driver.googlecode.com/files/JsTestDriver-1.0b.jar) ...'
    Net::HTTP.start("js-test-driver.googlecode.com") do |http|
      resp = http.get("/files/JsTestDriver-1.0b.jar")
      open("lib/js-test-driver/JsTestDriver.jar", "wb") do |file|
        file.write(resp.body)
      end
    end
    puts 'JsTestDriver Downloaded'
  end
end


# clean deletes built copies
CLEAN.include('dist/')
# clobber cleans and uninstalls JsTestDriver server
CLOBBER.include('lib/js-test-driver/*.jar')  
