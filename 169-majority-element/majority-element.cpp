class Solution {
public:
    int majorityElement(vector<int>& nums) {
        sort(nums.begin(),nums.end());
        int cv = 1;
        int maxc = 1;
        int ans = nums[0];

        for (int i=1;i<nums.size();i++){
            if (nums[i]==nums[i-1]){
                cv++;
            }
            else{
                cv=1;
            }
            if(cv>maxc){
                maxc=cv;
                ans=nums[i];
            }
        }
        return ans;
    }
};