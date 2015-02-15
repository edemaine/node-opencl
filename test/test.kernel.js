var cl = require('../lib/opencl'),
  should = require('chai').should(),
  util = require('util'),
  testUtils = require("../lib/test_utils"),
  log = console.log,
  assert = require("chai").assert,
  fs = require("fs");

var squareKern = fs.readFileSync(__dirname + "/kernels/square.cl").toString();
var squareCpyKern = fs.readFileSync(__dirname + "/kernels/square_cpy.cl").toString();

function testString(kernel, name) {
  it(name+" should return a string",function(done) {
    var val=cl.getKernelInfo(kernel,eval("cl."+name));
    assert.isString(val);
    done(log(name+" = " + val))
  })
}

describe("Kernel", function () {

  describe("#createKernel", function () {

    it("should return a valid kernel", function () {
      testUtils.withContext(function(ctx){
        testUtils.withProgram(ctx, squareKern, function(prg){
          var k = cl.createKernel(prg, "square");

          assert.isNotNull(k);
          assert.isDefined(k);
          cl.releaseKernel(k);
        });
      });
    });

    it("should fail as kernel does not exists", function () {
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          testUtils.bind(cl.createKernel, prg, "i_do_not_exist").should.throw();
        });
      });
    });

  });


  describe("#createKernelsInProgram", function () {

    it("should return two valid kernels", function() {
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, [squareKern, squareCpyKern].join("\n"), function (prg) {
          var kerns = cl.createKernelsInProgram(prg, 2);

          assert.isNotNull(kerns);
          assert.isDefined(kerns);
          assert(kerns.length == 2);
          assert.isNotNull(kerns[0]);
          assert.isDefined(kerns[0]);
          assert.isNotNull(kerns[1]);
          assert.isDefined(kerns[1]);

          cl.releaseKernel(kerns[0]);
          cl.releaseKernel(kerns[1]);
        });
      });
    });

  });


  describe("#retainKernel", function () {

    it("should increment reference count", function () {
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");

          var before = cl.getKernelInfo(k, cl.KERNEL_REFERENCE_COUNT);
          cl.retainKernel(k);
          var after = cl.getKernelInfo(k, cl.KERNEL_REFERENCE_COUNT);
          assert(before + 1 == after);
          cl.releaseKernel(k);
        });
      });
    });

  });

  describe("#releaseKernel", function () {

    it("should decrement reference count", function () {
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");
          var before = cl.getKernelInfo(k, cl.KERNEL_REFERENCE_COUNT);

          cl.retainKernel(k);
          cl.releaseKernel(k);
          var after = cl.getKernelInfo(k, cl.KERNEL_REFERENCE_COUNT);

          //assert(before == after);
          cl.releaseKernel(k);
        });
      });
    })

  });

  describe("#setKernelArg", function () {

    it("should be implemented", function () {
      // TODO
      assert(false, "not implemented");
    });

  });

  describe("#getKernelInfo", function () {

    it("should have valid types for properties", function () {
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");

          testString(k, "KERNEL_ATTRIBUTES");
          testString(k, "KERNEL_FUNCTION_NAME");
          testString(k, "KERNEL_REFERENCE_COUNT");
          testString(k, "KERNEL_NUM_ARGS");

          var c = cl.getKernelInfo(k, cl.KERNEL_CONTEXT);
          var p = cl.getKernelInfo(k, cl.KERNEL_PROGRAM);

          assert.isDefined(c, "context is undefined");
          assert.isDefined(p, "program is undefined");
        });
      });
    });

    it("should return the corresponding number of arguments", function () {
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");
          var nb_args = cl.getKernelInfo(k, cl.KERNEL_NUM_ARGS);

          if (nb_args != 3) {
            assert.fail(nb_args, 3);
          }
        });
      });
    });

    it("should return the corresponding kernel name", function () {
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");
          var name = cl.getKernelInfo(k, cl.KERNEL_FUNCTION_NAME);

          if (name != "square") {
            assert.fail(name, "square");
          }
        });
      });
    });

    it("should return the corresponding context", function () {
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");
          var c = cl.getKernelInfo(k, cl.KERNEL_CONTEXT);

          assert.isObject(c);
        });
      });
    });

    it("should return the corresponding program", function () {
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");
          var p = cl.getKernelInfo(k, cl.KERNEL_PROGRAM);

          assert.isObject(p);
        });
      });
    });

  });

  describe("#getKernelArgInfo", function () {
    it("should have valid types for properties", function(){
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");

          cl.getKernelArgInfo(k, 0, cl.KERNEL_ARG_ADDRESS_QUALIFIER).should.be.a.integer;
          cl.getKernelArgInfo(k, 0, cl.KERNEL_ARG_ACCESS_QUALIFIER).should.be.a.integer;
          cl.getKernelArgInfo(k, 0, cl.KERNEL_ARG_TYPE_QUALIFIER).should.be.a.integer;

          testString(k, "KERNEL_ARG_TYPE");
          testString(k, "KERNEL_ARG_NAME");
        });
      });
    });

    it("should return the corresponding names", function(){
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");
          var n1 = cl.getKernelArgInfo(k, 0, cl.KERNEL_ARG_NAME);
          var n2 = cl.getKernelArgInfo(k, 1, cl.KERNEL_ARG_NAME);
          var n3 = cl.getKernelArgInfo(k, 2, cl.KERNEL_ARG_NAME);

          assert.equal(n1, "input");
          assert.equal(n2, "output");
          assert.equal(n3, "count");
        });
      });
    });


    it("should return the corresponding types", function(){
      testUtils.withContext(function (ctx) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");
          var n1 = cl.getKernelArgInfo(k, 0, cl.KERNEL_ARG_TYPE_NAME);
          var n2 = cl.getKernelArgInfo(k, 1, cl.KERNEL_ARG_TYPE_NAME);
          var n3 = cl.getKernelArgInfo(k, 2, cl.KERNEL_ARG_TYPE_NAME);

          assert.equal(n1, "float*");
          assert.equal(n2, "float*");
          assert.equal(n3, "uint");
        });
      });
    });
  });

  describe("#getKernelWorkGroupInfo", function () {

    it("should have valid types for properties", function(){
      testUtils.withContext(function (ctx, device) {
        testUtils.withProgram(ctx, squareKern, function (prg) {
          var k = cl.createKernel(prg, "square");

          cl.getKernelWorkGroupInfo(k, device, cl.KERNEL_COMPILE_WORK_GROUP_SIZE).should.be.an.array;
          cl.getKernelWorkGroupInfo.bind(cl.getKernelWorkGroupInfo,k, device, cl.KERNEL_GLOBAL_WORK_SIZE)
            .should.throw(cl.INVALID_VALUE.message);

          cl.getKernelWorkGroupInfo(k, device, cl.KERNEL_PREFERRED_WORK_GROUP_SIZE_MULTIPLE).should.be.an.integer;
          cl.getKernelWorkGroupInfo(k, device, cl.KERNEL_WORK_GROUP_SIZE).should.be.an.integer;

          cl.getKernelWorkGroupInfo(k, device, cl.KERNEL_LOCAL_MEM_SIZE).should.be.an.integer;
          cl.getKernelWorkGroupInfo(k, device, cl.KERNEL_PRIVATE_MEM_SIZE).should.be.an.integer;
        });
      });
    })
  });

});
