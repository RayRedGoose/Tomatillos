import React from 'react';
import { Login, mapDispatchToProps } from './Login.js';
import { shallow } from 'enzyme';
import { postSignIn } from '../../apiCalls/apiCalls';
import { addUser } from '../../actions'

jest.mock('../../apiCalls/apiCalls');

describe('Login', () => {
  const mockUser = {email: 'email', name: 'name'};

  describe("component", () => {
    let container, instance, mockEvent;
    const addUser = jest.fn();

    beforeEach(() => {
      container = shallow(
        <Login addUser={addUser} history={{push: jest.fn()}}/>
      );
      instance = container.instance();
      mockEvent = {
        target: {
          id: 'email',
          value: 'new value',
        },
        preventDefault: jest.fn()
      }
    });

    it('Should match the snapshot', () => {
      expect(container).toMatchSnapshot();
    });

    it('Should attempt to login when the button is clicked', () => {
      instance.handleSubmit = jest.fn();
      container.find('.sign-in').simulate('click');
      expect(instance.handleSubmit).toHaveBeenCalled();
    });

    it('Should have blank strings as a default for all state values', () => {
      expect(instance.state).toEqual({
        email: '',
        password: '',
        errorMsg: ''
      });
    });

    it('Should call handleChange on keyup of the email input', ()=> {
      instance.handleChange = jest.fn();
      container.find('#email').simulate('change', mockEvent);
      expect(instance.handleChange).toHaveBeenCalledWith(mockEvent);
    });

    it('Should call handleChange on keyup of the password input', ()=> {
      instance.handleChange = jest.fn();
      mockEvent.id = 'password';
      container.find('#password').simulate('change', mockEvent);
      expect(instance.handleChange).toHaveBeenCalledWith(mockEvent);
    });

    describe('validateForm', () => {

      it('Should update the error message if there is no email and password', () => {
        instance.validateForm();
        expect(instance.state.errorMsg).toEqual('Please enter an email and a password');
      });

      it('Should return false if there is no email and password entered', () => {
        expect(instance.validateForm()).toEqual(false);
      });

      it('Should return true if there is an email and password entered', () => {
        instance.state = {
          email: 'test email',
          password: 'test password',
          errorMsg: ''
        }
        expect(instance.validateForm()).toEqual(true);
      });

    });

    describe('handleChange', () => {

      it('Should remove the error message if the fields are filled in', () => {
        instance.state = {
          email: 'test email',
          password: 'test password',
          errorMsg: 'test error'
        }
        instance.handleChange(mockEvent);
        expect(instance.state.errorMsg).toEqual('');
      });

      it('Should update the email in state if the target is the email input', () => {
        instance.handleChange(mockEvent);
        expect(instance.state.email).toEqual('new value');
      });

      it('Should update the password in state if the target is the password input', () => {
        mockEvent = {
          target: {
            id: 'password',
            value: 'new value'
          }
        }
        instance.handleChange(mockEvent);
        expect(instance.state.password).toEqual('new value');
      });

    });

    describe('handleSubmit', () => {

      it('Should update the error message in state if the form isn\'t validated', () => {
        instance.handleSubmit(mockEvent);
        expect(instance.state).toEqual({
          email: '',
          password: '',
          errorMsg: 'Please enter an email and a password'
        });
      });

      it('Should call the fetchUser function',  () => {
        instance.state = {
          email: 'test email',
          password: 'test password',
          errorMsg: ''
        };
        instance.fetchUser = jest.fn();
        instance.handleSubmit(mockEvent);
        expect(instance.fetchUser).toHaveBeenCalledWith({
          email: 'test email',
          password: 'test password'
        });
      });

    });

    describe('fetchUser', () => {

      it('Should call the postSignIn function with the correct argument', () => {
        instance.fetchUser(mockUser);
        postSignIn.mockImplementation(() => {
          return Promise.resolve(mockUser)
        });
        expect(postSignIn).toHaveBeenCalledWith(mockUser);
      });

      it('Should reset the state if the promise resolves', () => {
        postSignIn.mockImplementation(() => {
          return Promise.resolve(mockUser)
        });
        instance.fetchUser(mockUser);
        expect(instance.state).toEqual({
          email: '',
          password: '',
          errorMsg: ''
        });
      });

      it('Should add and error message to state if the promise rejects', async () => {
        postSignIn.mockImplementation(() => {
          return Promise.reject(Error('fetch failed'))
        });
        await instance.fetchUser(mockUser);
        expect(instance.state).toEqual({
          email: '',
          password: '',
          errorMsg: 'Your email or password was incorrect'
        });
      });

      it('Should invoke the addUser function if the promise resolves', async () => {
        postSignIn.mockImplementation(() => {
          return Promise.resolve(mockUser)
        });
        await instance.fetchUser(mockUser);
        expect(instance.props.addUser).toHaveBeenCalled();
      });

      it('Should invoke the history.push function if the promise resolves',async () => {
        postSignIn.mockImplementation(() => {
          return Promise.resolve(mockUser)
        });
        await instance.fetchUser(mockUser);
        expect(instance.props.history.push).toHaveBeenCalledWith('/ratings');
      });
    });
  });

  describe("mapDispatchToProps", () => {
    it('calls dispatch with an addUser action when addUser is called', () => {
      // Setup
      const actionToDispatch = addUser(mockUser);
      const mockDispatch = jest.fn();
      const mappedProps = mapDispatchToProps(mockDispatch);
      console.log(addUser);
      // Execution
      mappedProps.addUser(mockUser);

      // Expectaion
      expect(mockDispatch).toHaveBeenCalledWith(actionToDispatch);
    });
  });

});
