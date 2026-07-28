class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> x;
        for (int num : nums) {
            if (x.find(num) != x.end(num)) {
                return true;
            }
            x.insert(num);
        }
        return false;
    }
};