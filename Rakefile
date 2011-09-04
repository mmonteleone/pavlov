require 'rubygems'
require 'net/http'
require 'rake/clean'
require 'packr'
require 'zip/zip'
require 'find'
require 'fileutils'
include FileUtils

task :default => :test

# list of browsers to auto-bind to JsTestDrive Server
# non-existent browsers will be ignored
BROWSERS = [
  '/Applications/Safari.app/Contents/MacOS/Safari',
  '/Applications/Firefox.app/Contents/MacOS/firefox',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Opera.app/Contents/MacOS/Opera',
  'C:/Program Files/Mozilla Firefox/firefox.exe',
  'C:/Program Files/Internet Explorer/iexplore.exe',
  'C:/Program Files/Safari/Safari.exe',
  'C:/Program Files/Opera/opera.exe' ]


desc "'Compiles' sources and examples together"
task :build => [:clean] do
  # build dist and lib directories
  mkdir 'dist'
  mkdir 'dist/lib'
  mkdir 'dist/example'

  # copy src
  cp 'pavlov.js', 'dist/pavlov.js'

  # copy documentation
  cp 'README.markdown', 'dist/README.markdown'

  # copy lib
  cp 'lib/qunit.js', 'dist/lib/qunit.js'
  cp 'lib/qunit.css', 'dist/lib/qunit.css'

  # copy example
  cp 'example/example.specs.html', 'dist/example/example.specs.html'
  cp 'example/example.specs.js', 'dist/example/example.specs.js'


  # minify src
  source = File.read('dist/pavlov.js')
  minified = Packr.pack(source, :shrink_vars => true, :base62 => false)
  header = /\/\*.*?\*\//m.match(source)

  # inject header
  File.open('dist/pavlov.min.js', 'w') do |combined|
    combined.puts(header)
    combined.write(minified)
  end
end

desc "Generates a releasable zip archive"
task :release => [:build] do
  root = pwd+'/dist'
  zip_archive = pwd+'/dist/Pavlov.zip'

  Zip::ZipFile.open(zip_archive, Zip::ZipFile::CREATE) do |zip|
    Find.find(root) do |path|
      Find.prune if File.basename(path)[0] == ?.
      dest = /dist\/(\w.*)/.match(path)
      zip.add(dest[1],path) if dest
    end
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
  sh("java -jar spec/lib/js-test-driver/JsTestDriver.jar --tests all --captureConsole --reset  --basePath ./ --config spec/lib/js-test-driver/jsTestDriver.conf")
end


desc "Start the JsTestDriver server"
task :server => [:install_server, :build] do
  browsers = BROWSERS.find_all{|b| File.exists? b}.join(',')
  sh("java -jar spec/lib/js-test-driver/JsTestDriver.jar --port 9876  --basePath ./ --config spec/lib/js-test-driver/jsTestDriver.conf --browser \"#{browsers}\"")
end


desc "Download Google JsTestDriver"
task :install_server do
  if !File.exist?('spec/lib/js-test-driver/JsTestDriver.jar') then
    puts 'Downloading JsTestDriver from Google (http://js-test-driver.googlecode.com/files/JsTestDriver-1.3.2.jar) ...'
    Net::HTTP.start("js-test-driver.googlecode.com") do |http|
      resp = http.get("/files/JsTestDriver-1.3.2.jar")
      open("spec/lib/js-test-driver/JsTestDriver.jar", "wb") do |file|
        file.write(resp.body)
      end
    end
    puts 'JsTestDriver Downloaded'
  end
end


# clean deletes built copies
CLEAN.include('dist/')
# clobber cleans and uninstalls JsTestDriver server
CLOBBER.include('spec/lib/js-test-driver/*.jar')
