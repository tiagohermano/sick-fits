import ItemComponent from '../components/Item';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

const fakeItem = {
  id: '123',
  title: 'Test Item',
  price: 1000,
  description: 'This is a test item',
  image: 'testItem.jpg',
  largeImage: 'testItem-large.jpg',
}

describe('<Item/>', () => {
  it('renders and matches the snapshot', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem}/>);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  it('renders the image properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem}/>);
    const img = wrapper.find('img');
    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);
  });

  it('renders the title and pricetag properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem}/>);
    const priceTag = wrapper.find('PriceTag');
    expect(priceTag.children().text()).toBe('$10');
    expect(wrapper.find('Title a').text()).toBe(fakeItem.title);
  });

  it('renders out the buttons properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem}/>);
    const buttonList = wrapper.find('.buttonList');
    expect(buttonList.children()).toHaveLength(3);
    expect(buttonList.find('Link').exists()).toBe(true);
    expect(buttonList.find('AddToCart').exists()).toBe(true);
    expect(buttonList.find('DeleteItem').exists()).toBe(true);
  });
})