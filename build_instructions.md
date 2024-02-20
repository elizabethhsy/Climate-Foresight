# Build instructions for `dcEmb` and `dcEmb-examples`

## dcEmb
### Prerequisites
Build tools: compiler supporting C++14, cmake, (git)
Dependencies: 
- Eigen3
- GoogleTest 
- Sphinx and doxygen (for documentation)

On Ubuntu, do
`sudo apt install g++ make cmake libeigen3-dev libgtest-dev doxygen`
`pip install sphinx`

This guide assumes you're running ubuntu or some other debian-based system.

### Build instructions
1. Clone the repo and `cd` into it
2. Modify `CMakeLists.txt` lines 131-132: Comment them out with a `#`
3. Make a build dir and cd into it `mkdir build && cd build`
4. run `cmake .. && cmake --build .`
   1. If "Cannot include Eigen/Dense: No such file or directory":
        This is because eigen 3 includes, when installed via `apt`, are in a folder called `eigen3/Eigen/...`
        You can either find the directory and add it into CMakeLists. Alternatively, you can edit every source file to include `<eigen3/Eigen/...>` instead of `<Eigen/...>`; or you can symlink them to a normal include dir. 
        `cd /usr/include # sometimes it is under /usr/local/include`
        `sudo ln -sf eigen3/Eigen Eigen`
        `sudo ln -sf eigen3/unsupported unsupported`
5. You should now have a shared object file `libdcEmb.so` and the executable `run_tests`.
6. You can try `run_tests`. Expect some failed tests due to numerical instability.
7. Python bindings:
   1. You will need a Python 3 environment. Our server runs on Python 3.8. You probably would want this python version. Installing old Python versions may be non-trivial on some systems. If you are on Ubuntu, you can follow [this](https://askubuntu.com/questions/682869/how-do-i-install-a-different-python-version-using-apt-get).
   2. Set up a venv with `python3.8 -m venv /path/to/venv` and activate it using `source /path/to/venv/bin/activate`. You will want a venv because the library uses distutils and uninstalling the package is not supported.
   3. Install Cython and NumPy. `pip install Cython numpy` 
   4. cd into `dcEmb/python` and edit `setup.py`. On line 14, add `, numpy.get_include()` to `include_dirs`. If you don't do this you may encounter compilation errors complaining about numpy.
   5. run `python3 setup.py build`.
   6. If any errors occur in the previous step, `rm -rf ./build` so retries are not affected by the failed build.
   7. Once the build succeeds, you can run `python3 setup.py install` (most likely you want to do this in a venv.)
   8. Verify your install using `python3 test.py`.

You have now built the library!

## dcEmb-examples
In the previous section, the library is not installed on your system -- this is good for quickly changing the library itself for debugging purposes.

We are going to continue to not install the library. Instead, we explicitly tell CMake where the built library is.

### Build instructions
1. Clone the dcEmb-examples repo.
2. Symlink the built library to somewhere convenient (call it `/path/to/library/`)
    You can do this via
    `ln -sf /path/to/built/library/libdcEmb.so /path/to/library/lib/`
    `ln -sf /path/to/dcEmb/include/bma_model.hh /path/to/library/include/`
    `ln -sf /path/to/dcEmb/include/bmr_model.hh /path/to/library/include/`
    `ln -sf /path/to/dcEmb/include/dynamic_model.hh /path/to/library/include/`
    `ln -sf /path/to/dcEmb/include/peb_model.hh /path/to/library/include/`
3. Tell CMake to use these directories when building:
   Edit CMakeLists.txt line 29: comment out the line `find_package(dcEmb)`. Instead replace it with `SET(dcEmb_LIB_PATH "$/path/to/library")`.
   Add a line within the include_directories (lines 31-38) to include `${dcEmb_LIB_PATH}/include`
   Add a link_directories after include_directories: `link_directories(${dcEmb_LIB_PATH}/lib)`
4. cd back into dcEmb-examples, make a build directory `build/` and cd into it.
5. run `cmake .. && cmake --build .`
6. Now you should have the executables `dcm_3body`, `dcm_covid`, and `dcm_weather`.

There are more than one way to do this, and you can adjust this to your liking.
This is why I have not pushed any changes to CMakeLists.txt to our repo, as things will probably be different on your system. 

### Usage

#### Climate model
You can run a test model with `./dcm_weather ssp585 a.txt` with the contents of `a.txt` being
`1.876 5.154 0.6435 2.632 9.262 52.93 1.285 2.691 0.4395 28.24 8`
to see what's going on.

You can also run the `run_all_climate_scenarios.sh` shell script. This runs all available weather scenarios with the default prior expectations. It copies and sanitizes the data, and then copy it to the webapi data directory.


#### 3body model
Run test with `./dcm_3body 0.04`.

The shell script `run_all_3body_scenarios.sh` runs only for `x=0.04` at the moment. This copies the result to the webapi data directory.
